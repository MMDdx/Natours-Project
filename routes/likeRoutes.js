const app = require('express');
const authController = require("../controllers/authController.js");
const likeController = require("../controllers/likeController.js");
const router = app.Router();

router.use(authController.protect)

router.route("/")
    .post(likeController.createLike)
    .get(authController.restrictTo("admin", "lead-guide"),likeController.getAllLikes)
router.route("/:id")
    .delete(likeController.deleteLike)

module.exports = router;