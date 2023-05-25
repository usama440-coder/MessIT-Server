const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    review: {
      type: String,
      minLength: 6,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
