const express = require("express");
const reviewRouter = express.Router();
const { addReview, getReviews } = require("../controllers/review.controller");
const { protect, permit } = require("../middleware/auth.middleware");

reviewRouter.post("/:id", protect, permit("user"), addReview);
reviewRouter.get(
  "/",
  protect,
  permit("user", "staff", "secretary"),
  getReviews
);

module.exports = reviewRouter;
