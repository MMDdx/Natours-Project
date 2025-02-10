const express = require('express');
const viewsController = require('../controllers/viewsController.js')
const router = express.Router();
const authController = require('../controllers/authController.js');
const bookingController = require('../controllers/bookingController.js');


router.get('/',bookingController.createBookingCheckout ,authController.isLoggedIn,viewsController.getOverview)
router.get('/sign-up',viewsController.getSignUpForm)
router.get("/login",authController.isLoggedIn, viewsController.getLoginForm)
router.get("/tour/:tourName", authController.isLoggedIn,viewsController.getTour)
router.get("/me",authController.protect ,viewsController.getAccount)
router.get("/my-tours",authController.protect ,viewsController.getMyTours)

router.get("/emailCon/:token", authController.protect, authController.emailConfirm)
// router.post("/submit-user-data", authController.protect , viewsController.updateUserData)

module.exports = router;