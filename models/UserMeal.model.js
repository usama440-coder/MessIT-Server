const mongoose = require("mongoose");

const UserMealSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meal",
      required: true,
    },
    isTaken: {
      type: Boolean,
      default: false,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Item",
        },
        name: {
          type: String,
          required: true,
        },
        units: {
          type: Number,
          required: true,
        },
        itemQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserMeal", UserMealSchema);
