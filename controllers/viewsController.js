const Tour = require("./../models/tourModel.js")
const catchAsync = require("./../utils/catchAsync.js");
const AppError = require("../utils/appError");
const User = require("./../models/userModel.js")
const Booking = require("./../models/bookingModel.js")

exports.getOverview =async (req, res, next) => {
    //1) get tours data from collection
    const tours = await Tour.find()
    //2) build template

    //3) Render that template using tours data from 1)
    res.status(200).render('overview', {
        title: 'All tours',
        tours,
    })
}

exports.getTour =catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.tourName}).populate({path:"reviews",
    fields: 'review rating user'
    }).populate({path:"likes", select:"user _id -tour"});

    if (!tour){
        return next(new AppError('No tour found with that name', 404))
    }
    res.status(200).render('tour', {
        title: `${tour.name} tour`,
        tour,
    })
})


exports.getLoginForm = (req,res,next) => {
    res.status(200).render('loginForm', {
        title: 'Log into your account! ',
    })
}

exports.getSignUpForm = (req,res,next) => {
    res.status(200).render('signUpForm', {
        title: 'Sign up!',
    })
}


exports.getAccount = (req,res)=>{
    res.status(200).render('account', {
        title: 'Your account',

    })
}

exports.getMyTours = catchAsync(async (req,res, next)=>{
    // 1 find all bookings
    const bookings = await Booking.find({user: req.user.id})
    // 2 find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour)
    const tours =  await Tour.find({ _id: { $in: tourIDs}})

    res.status(200).render('overview', {
        title: "My Tours",
        tours
    })
})


exports.updateUserData = async (req,res,next)=>{
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email,
    },{
        new: true,
        runValidators: true
    })
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    })
}
