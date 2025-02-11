const AppError = require('./../utils/appError.js');


const handleCastErrorDB = err =>{
    const message = `invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err =>{
    const value = err.message.match(/"([^"\\]|\\.|\\\n)*"|'([^'\\]|\\.|\\\n)*'/)

      const message = `Duplicate field val ${value} please use another!`;
    return new AppError(message, 400)
}

const handleJWTError= (err)=>{
    return new AppError("invalid token! please log in!", 401)
}
const handleJWTExpiredError = err => new AppError("expired token! please log in again!", 401)

const sendErrorDev = (err,req,res) =>{
    // api
    if (req.originalUrl.startsWith('/api')){

        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack:err.stack,
            err
        })
    }
    // rendered website!
    return res.status(err.statusCode).render("error", {
        title: "something went wrong!",
        msg: err.message
    })
}
const sendErrorProduction = (err,req,res) =>{
    // api
    if (req.originalUrl.startsWith('/api')){
        if (err.isOperational){
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        else {

            res.status(500).json({
                status: 'error',
                message: "something went wrong!"
            })
        }
    } else {
        // rendered. dont share details!
        if (err.isOperational){
            res.status(err.statusCode).render("error", {
                title: "something went wrong!",
                msg: err.message
            })
        }
        else {
            res.status(err.statusCode).render("error", {
                title: "something went wrong!",
                msg: "please try again later!"
            })
        }

    }



}

const handleValidationErrorDB = (err)=>{
    const errors = Object.values(err.errors).map(val => val.message)
    const message = `invalid input data. ${errors.join(". ")}`;
    return new AppError(message, 400)
}


module.exports = (err,req, res, next)=>{
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500


    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
       sendErrorDev(err,req, res)
    }else if (process.env.NODE_ENV === "production") {
        let error = {...err};
        error.message = err.message;
        if (err.name === "CastError"){
            error = handleCastErrorDB(err)
        }
        if (err.code === 11000) {

            error = handleDuplicateFieldsDB(err)
        }
        if (err.name === "ValidationError"){
            error = handleValidationErrorDB(err)
        }
        if (err.name === "JsonWebTokenError"){
            error = handleJWTError(err)
        }
        if (err.name === "TokenExpiredError"){
            error = handleJWTExpiredError(err)
        }

        sendErrorProduction(error,req,res)
    }

}