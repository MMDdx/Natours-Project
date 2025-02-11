const express = require("express")
const path = require("path")
const morgan = require("morgan")
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController.js')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const tour_router = require("./routes/tourRoutes.js")
const user_router = require("./routes/userRoutes.js")
const review_router = require("./routes/reviewRouter.js")
const mongoSanitize = require("express-mongo-sanitize")
const xss = require('xss-clean')
const hpp = require("hpp")
const viewRouter = require("./routes/viewRoutes.js")
const bookingRouter = require("./routes/bookingRoutes.js")
const likesRoutes = require("./routes/likeRoutes.js")
const compression = require("compression")

const cookie_parser = require("cookie-parser")
// start express app
const app = express()
app.set("view engine", "pug")
app.set('views', path.join(__dirname, 'views'))

// serving static files
app.use(express.static(`${__dirname}/public`));
// global middle wares

// app.use((req, res, next) => {
//     res.setHeader("Content-Security-Policy", "script-src 'self' https://cdnjs.cloudflare.com");
//     next();
// });
// security http headers
app.use(helmet({contentSecurityPolicy: false}))


if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'));
}
// limit req
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "too many requests from this ip. try again in an hour"
})

app.use("/api", limiter)
// body parser
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookie_parser())
// data sanitization against NoSql query injections
app.use(mongoSanitize())

// data sanitization against XSS
app.use(xss())


// prevent parameter pollution
app.use(hpp({
    whitelist: ["duration",'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'price']
}))

app.use(compression())

// test middleware
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})
// routes



app.use('/', viewRouter)
app.use("/api/v1/tours", tour_router)
app.use("/api/v1/users", user_router)
app.use("/api/v1/reviews", review_router)
app.use("/api/v1/bookings", bookingRouter)
// added likes here!
app.use("/api/v1/likes", likesRoutes)
app.all('*', (req, res, next)=>{
    // const err = new Error(`cant find ${req.originalUrl} on this server!`)
    // err.status = "fail"
    // err.statusCode  = 404
    next(new AppError(`cant find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app