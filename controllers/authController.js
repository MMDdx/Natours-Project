const {promisify} = require("util")
const User = require('./../models/userModel.js')
const catchAsync = require("./../utils/catchAsync.js")
const jwt = require("jsonwebtoken")
const AppError = require("./../utils/appError.js")
const Email = require("./../utils/email.js")
const crypto = require("crypto")

const signToken = id =>{
   return  jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
}

const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id)
    const cookie_options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 *60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookie_options.secure = true
    }
    user.password = undefined
    res.cookie('jwt', token, cookie_options)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async (req, res, next) =>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    })
    const url = `${req.protocol}://${req.get('host')}/me`
    const resetToken = newUser.createEmailToken()
    await newUser.save({validateBeforeSave:false})
    const resetURL = `${req.protocol}://${req.get('host')}/emailCon/${resetToken}`
    try {
        await new Email(newUser, resetURL).sendEmailVerification()

    }catch (err){
    }

    createSendToken(newUser, 201, res)

})

exports.login = catchAsync(async (req,res, next)=>{
    const {email, password} = req.body
    // 1) check if email and pass exists
    if (!email || !password) {
        return next(new AppError("please provide email and password!"))
    }
    //2) check if user exists && password is correct
    const user =await User.findOne({email}).select("+password")
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("incorrect email or password!"), 401)
    }
    // 3) if everything is ok send token to client!
    createSendToken(user, 200, res)
})

exports.logOut = (req,res) => {
    res.cookie('jwt', "loggedOut", {
        expires: new Date(Date.now() + 10000),
        httpOnly: true,
    })
    res.status(200).json({status: 'success'})
}



exports.protect = catchAsync(async (req,res,next)=>{
    // 1 - getting token and check if its there!

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }else if (req.cookies.jwt){
        token = req.cookies.jwt;
    } else {
        return next(new AppError("there is no token!", 401))
    }
    let decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET).catch(next);
    // 2 - verfiacation token

    // 3 check if user still exists

    const current_user = await User.findById(decoded.id)

    if (!current_user) {
        return next(new AppError("the user belonging to this token does no longer exists!",401))
    }

    // 4 - check if user changed password after the token was issued
    if(current_user.changedPasswordAfter(decoded.iat)){
        return next(new AppError("user recently changed password! please login again!"))
    }
    // GRANT access to protected Route!
    req.user = current_user
    // for detail templates
    res.locals.user = current_user
    next()
})


exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is a array
        if (!roles.includes(req.user.role)){
            return next(new AppError("you do not have permission to perform this action!", 403))
        }
        next()
    }
}

exports.forgotPassword = async (req,res,next)=>{
    // get user based on posted email
    const user = await User.findOne({email:req.body.email})
    if (!user){
        return next(new AppError("there is no user with  that email address.", 404))
    }
    // // generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})
    // sent it users email
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

        await new Email(user, resetURL).sendPasswordReset()
        res.status(200).json({
            status: 'success',
            message: `token sent to email!`
        })
    }catch (err){
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave:false})

        return next(new AppError(`there was a problem sending the email!`,500))
    }

}
exports.resetPassword = catchAsync(async (req,res,next)=>{
    // get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user =await User.findOne({PasswordResetToken: hashedToken, passwordResetExpires:{$gt: Date.now()}})

    // if token not expired and there is user ,set the pass
    if (!user) {
        return next(new AppError("token is invalid or has expired", 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.PasswordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
    // update changedpasswordAt property for the user

    // log the user in, send JWT !
    createSendToken(user, 200, res)
})

exports.updatePassword =catchAsync(async (req,res,next)=>{
    // get user from the collection
            // let decoded = await get_decoded(req)
    let user = await User.findById(req.user.id).select("+password")

    // check if posted password is correct
    // if password is correct=> update password
    let password = req.body.password
    if (!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("user does not exists or your current password is wrong!",401))
    }
    // log user in ,send JWT
    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()
    let signed_token = signToken(user._id)
    res.status(200).json({
            status: 'success',
            token: signed_token
        }
    )
})

exports.emailConfirm = catchAsync(async (req,res,next)=>{
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user =await User.findOne({emailConfirmToken: hashedToken})
    if (!user) {
        return next(new AppError("email Token is not valid!", 401))
    }

    user.emailConfirmToken = undefined;
    user.emailConfirmed = true;
    await user.save({validateBeforeSave:false})

    res.redirect('/')
})


// only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};
