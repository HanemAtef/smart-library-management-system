const Review = require("../models/Review");
const Book = require("../models/Book");
///////////////////////////////////////////
const addReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    const book = await Book.findById(bookId);
    //check if book exist
    if (!book) {
      return res.status(404).json({
        success: false,
        msg: "Book not found",
      });
    }
    //if user already add review
    const existingReview = await Review.findOne({ user: userId, book: bookId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        msg: "You have already reviewed this book",
      });
    }
    //validate
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        msg: "Rating and comment are required",
      });
    }
    const review = await Review.create({
      user: userId,
      book: bookId,
      rating,
      comment,
    });
    // update the rev
    const allReviews = await Review.find({ book: bookId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    book.averageRating = avgRating;
    await book.save();

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name",
    );

    res.status(201).json({
      success: true,
      msg: "Review added successfully",
      data: populatedReview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
//////////////////////////////////////////////////////////////////////////////
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const { rating, comment } = req.body;
    //get the rev
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        msg: "Review not found",
      });
    }

    //
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You can only update your own reviews",
      });
    }

    //update
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    const allReviews = await Review.find({ book: review.book });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Book.findByIdAndUpdate(review.book, { averageRating: avgRating });

    const updatedReview = await Review.findById(reviewId).populate(
      "user",
      "name",
    );

    res.status(200).json({
      success: true,
      msg: "Review updated successfully",
      data: updatedReview,
    });
  } catch (err) {
    console.error("Error in updateReview:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};
////////////////////////////////////////////////////////////////////////

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
const userRole = req.user.role;
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        msg: "Review not found",
      });
    }

    if (
      review.user.toString() !== userId.toString() &&
      userRole !== "admin")
     {
      return res.status(403).json({
        success: false,
        msg: "You can only delete your own reviews",
      });
    }

    await review.deleteOne();

    const allReviews = await Review.find({ book: review.book });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;
    await Book.findByIdAndUpdate(review.book, { averageRating: avgRating });

    res.status(200).json({
      success: true,
      msg: "Review deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteReview:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

///////////////////////////////////////////////////////////////////////////
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        msg: "Book not found",
      });
    }

    const reviews = await Review.find({ book: bookId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const ratingStats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    reviews.forEach((review) => {
      ratingStats[review.rating]++;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: book.averageRating,
      ratingStats,
      data: reviews,
    });
  } catch (err) {
    console.error("Error in getBookReviews:", err);
    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
};

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getBookReviews,
};
