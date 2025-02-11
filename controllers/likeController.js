const Like = require('./../models/likeModel');
const factory = require("./handlerFactory.js")
const catchAsync = require("./../utils/catchAsync.js")
const User = require("./../models/userModel");
const AppError = require("../utils/appError");

exports.createLike = catchAsync(async (req, res, next) => {
    const {tour} = req.body

    await Like.create({
        tour,
        user:req.user.id
    })
    res.status(201).json({
        status: "success",
    })
})

exports.getAllLikes = factory.getAll(Like)

exports.deleteLike = catchAsync(async (req, res, next) => {
    // with tour id and user id:
    const like = await Like.findOne({tour: req.params.id, user:req.user.id})
    if (!like) return next(new AppError("like did not found", 400))
    await like.deleteOne()


    res.status(204).json({
        message: "success!",
    })
})
exports.getOneLike = factory.getOne(Like)

