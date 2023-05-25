const asyncHandler = require("express-async-handler");
const Review = require("../models/Review.model");
const Meal = require("../models/Meal.model");

// @desc    Add a review
// @route   POST /api/v1/review/:id
// @access  User(own mess only)
const addReview = asyncHandler(async (req, res) => {
  const { review, rating } = req.body;

  // rating is required
  if (!rating) {
    res.status(400);
    throw new Error("Select rating");
  }

  // rating range is 1 - 5
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating range is 1 to 5");
  }

  // already reviewed
  const isExists = await Review.findOne({
    user: req.user._id,
    meal: req.params.id,
  });

  if (isExists) {
    res.status(400);
    throw new Error("Already Reviewed");
  }

  const newReview = await Review.create({
    review,
    rating,
    meal: req.params.id,
    user: req.user._id,
    mess: req.user.mess,
  });

  res.status(200).json({ success: true, newReview });
});

// @desc    Get all reviews
// @route   GET /api/v1/review/
// @access  *
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.aggregate([
    {
      $match: {
        mess: req.user.mess,
      },
    },
    {
      $lookup: {
        from: "meals",
        localField: "meal",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $unwind: {
        path: "$mealData",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: {
        path: "$userData",
      },
    },
  ]);

  res.status(200).json({ success: true, reviews });
});

module.exports = { addReview, getReviews };
