const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require('crypto')
const userSchema =new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please tell us your name!"],

    },

    email: {
        type:String,
        required: [true, "please provide your email address!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email!']
    },
    photo: {
        type: String,
        default: "default.jpg",
    },
    role:{
        type: String,
        enum: ["user", 'guide', 'lead-guide', 'admin'],
        default: "user",
    },
    password: {
        type:String,
        required: [true, "please provide your password!"],
        minLength: [8, 'must be at least 8 characters!'],
        select: false
    },
    passwordConfirm: {
        type:String,
        required: [true, "please confirm your password!"],
        validate: {
            // this only works only on SAVE AND CREATE!
            validator: function (val){
                return val === this.password
            },
            message: "confirm password is not equal to password!"
        }
    },
    passwordChangedAt: Date,
    PasswordResetToken: String,
    passwordResetExpires: Date,

    emailConfirmToken: String,
    emailConfirmed: {
        type: Boolean,
        default: false
    },
    active:{
        type: Boolean,
        default: true,
        select: false
    }

})
userSchema.pre("save",async function (next){
    if (!this.isModified("password")) {
       return next();
    }

    // hash pass with cost of 12

    this.password =await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function (next){
    if (!this.isModified("password") || this.isNew) {
        return next();
    }
    this.passwordChangedAt =Date.now() - 1000;
    next()
})

userSchema.pre(/^find/, function(next){
    // this points to current query
    this.find({active: {$ne: false}})
    next()
})

userSchema.methods.correctPassword =async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp){
    if (this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return JWTTimeStamp < changedTimestamp
    }

    return false
}

userSchema.methods.createPasswordResetToken = function (){
    const resetToken = crypto.randomBytes(32).toString('hex')
   this.PasswordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.passwordResetExpires = Date.now() + 600 * 1000

    return resetToken
}

userSchema.methods.createEmailToken = function (){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.emailConfirmToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    return resetToken
}



const User = mongoose.model("User", userSchema);
module.exports = User;