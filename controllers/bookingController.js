const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Tour = require("./../models/tourModel.js")
const catchAsync = require("./../utils/catchAsync.js")
const AppError = require("../utils/appError");
const factory = require("./handlerFactory.js")
const Booking = require("./../models/bookingModel.js")


exports.getCheckOutSession = catchAsync(async (req, res, next) => {
    // 1 get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // 2 create checkout session


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                price: 'price_1Qpo9m6lMTPDR3BwNqp933uC',
                quantity: 1

            }
        ],
        mode: "payment",
    })
    // 3 create session as response
    res.status(200).json({
        status: "success",
        session
    })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // temp. unsecure!
    const {tour, user, price} = req.query
    if (!tour || !price || !user) {
        return next()
    }
    await Booking.create({tour, user, price})
    res.redirect(req.originalUrl.split('?')[0])
})
// crud

exports.createBooking = factory.createOne(Booking)
    //
    // catchAsync(async (req, res, next) => {
    //     const booking = await Booking.create({
    //         tour: req.body.tour,
    //         user: req.user.id,
    //         price: req.body.price,
    //         paid: false
    //     })
    //     res.status(200).json({
    //         status: "success",
    //         data:{
    //             booking
    //         }
    //     })
    // })


exports.getBooking = factory.getOne(Booking)

exports.updateBooking = factory.updateOne(Booking)

exports.deleteBooking = factory.deleteOne(Booking)

exports.getAllBooking = factory.getAll(Booking)