const mongoose = require("mongoose");

const MealSchema = mongoose.Schema(
  {
    type: {
      type: String,
      ref: "MealType",
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    closingTime: {
      type: Date,
      required: true,
    },
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        units: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meal", MealSchema);
