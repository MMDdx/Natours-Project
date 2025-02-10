const express = require("express");
const tourController = require("./../controllers/tourControllers.js");
const tour_router = express.Router();
const authController = require("./../controllers/authController.js");
const reviewRouter = require("./../routes/reviewRouter.js");
// tour_router.param("id", tourController.checkId)

tour_router.route("/top-5-cheap").get(tourController.aliasTopTours, tourController.getAllTours)
tour_router.route("/tours-stats").get(tourController.getTourStats)
tour_router.route("/monthly-plan/:year").get(authController.protect,authController.restrictTo('admin', "lead-guide", "normal-guide") ,tourController.getMonthlyPlan)

tour_router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)


tour_router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances)


tour_router.route("/").get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', "lead-guide"),tourController.createTour)

tour_router.route("/:id")
    .get(tourController.getTour)
    .patch(authController.protect,authController.restrictTo('admin', "lead-guide") ,tourController.uploadTourImages, tourController.resizeTourImages ,tourController.updateTour)
    .delete(authController.protect,authController.restrictTo('admin', "lead-guide") ,tourController.deleteTour)

tour_router.use("/:tourId/reviews", reviewRouter)


module.exports = tour_router
