const express = require("express");
const userController = require("./../controllers/userControllers.js");
const authController = require("./../controllers/authController.js");
const multer = require("multer");


// app.get("/api/v1/tours", getAllTours)
// app.post("/api/v1/tours", createTour)
// app.get("/api/v1/tours/:id", getTour)


const user_router = express.Router();

user_router.post('/forgotPassword', authController.forgotPassword)
user_router.patch('/resetPassword/:token', authController.resetPassword)
user_router.post('/signup', authController.signup)
user_router.post('/login', authController.login)
user_router.get('/logout', authController.logOut)
// protect all routes after this middleware
user_router.use(authController.protect)

user_router.get("/me",  userController.getMe, userController.getUser)
user_router.patch("/updatePassword",authController.updatePassword)

user_router.patch("/updateMe" , userController.uploadUserPhoto,userController.resizeUserPhoto ,userController.updateMe)
user_router.delete("/deleteMe", userController.deleteMe)

user_router.use(authController.restrictTo("admin"))

user_router.route("/").get(userController.getAllUsers).post(userController.createUser)
user_router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)




module.exports = user_router;