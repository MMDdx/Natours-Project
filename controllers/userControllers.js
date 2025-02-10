const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require("../utils/appError");
const sharp = require('sharp')
const factory = require("./handlerFactory.js")
const multer = require("multer");

// const multerStorage = multer.diskStorage({
//     destination:  (req, file, cb) => {
//         cb(null, "public/img/users")
//     },
//     filename: (req, file, cb) => {
//         // user-userId-currentTimeStamp.extension
//         const extension = file.mimetype.split("/")[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`)
//     }
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[0] === "image"){
        cb(null, true)
    }else {
        cb(new AppError("Not an image! please upload only images!", 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =catchAsync( async (req, res, next) =>{
        if(!req.file) return next()

        req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

        await sharp(req.file.buffer).resize(500, 500)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/users/${req.file.filename}`)

        next()
    }
)

const filterBody= (obj, ...allowedFields) =>{
    let newObj = {}
    Object.keys(obj).forEach((el)=>{
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getAllUsers = factory.getAll(User)

exports.getMe = (req,res,next)=>{
    req.params.id = req.user.id
    next()
}


exports.updateMe =catchAsync(async (req,res,next) =>{

    // Create error if user Posts password data
    if (req.body.password || req.body.passwordConfirm){
        return next(new AppError("this route is not for password updates! use updateMe",400))
    }
    // update user document
    const filteredBody = filterBody(req.body, "name", "email")
    if (req.file) filteredBody.photo = req.file.filename;

    const updatedUser =await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true})
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })
})

exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active:false},)
    console.log("deleting!!!!")
    res.status(204).json({
        status: "success",

    })
})


exports.createUser = (req,res)=>{
    res.status(500).json({
        status: "error",
        message: "please use sign up!"
    })
}
exports.getUser = factory.getOne(User)
// Do not update passwords with this!
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
