const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures.js");

exports.deleteOne = Model => catchAsync (async (req,res,next)=>{
    let document = await Model.findByIdAndDelete(req.params.id)
    if (!document){
        return next(new AppError("No document with that id found",404))
    }
    res.status(204).json({
        message: "success!",
    })
})

exports.updateOne = Model => catchAsync (async (req,res,next)=>{
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!Model){
        return next(new AppError("No doc with that id found",404))
    }
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
        status: "success",
        data:{
            data: newDoc
        }
    })
})
exports.getOne = (Model, populateOptions) =>  catchAsync(async (req, res,next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions){
        query = query.populate(populateOptions)
    }
    const document = await query// tours.findOne({_id: req.params.id})
    if (!document){
        return next(new AppError("No doc with that id found",404))
    }

    res.status(200).json({
        status: "success",
        data: {
            data:document
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // to allow for nested Get reviews on tours (hack)
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId}

    const features = new APIFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()
    const doc = await  features.query; // explain()

    res.status(200).json({
        status: "success",
        results: doc.length,
        data: doc
    })
})
