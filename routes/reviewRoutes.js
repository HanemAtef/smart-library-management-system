// routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const {
  addReview,
  updateReview,
  deleteReview,
  getBookReviews,
} = require("../controllers/reviewControllers");
const { authMiddleware } = require("../middlewares/authMiddlewares");
const validate = require("../middlewares/validationMiddleware");
const {
  addReviewSchema,
  updateReviewSchema,
} = require("../validations/reviewValidation");

router.get("/:bookId", getBookReviews);

router.post("/:bookId", authMiddleware, validate(addReviewSchema), addReview);

router.put(
  "/:reviewId",
  authMiddleware,
  validate(updateReviewSchema),
  updateReview,
);

router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;
