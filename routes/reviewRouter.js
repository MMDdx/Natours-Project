const express = require('express');
const router = express.Router({mergeParams: true});
const reviewController = require('./../controllers/reviewController.js');
const authController = require('./../controllers/authController.js');

router.use(authController.protect)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo("user","admin"),reviewController.setTourUserIds,reviewController.createReview);
router.route("/:id").delete(authController.restrictTo("admin", 'user'),reviewController.deleteReview)
    .patch(authController.restrictTo("admin", 'user'),reviewController.updateReview)
    .get(reviewController.getReview)

module.exports = router;