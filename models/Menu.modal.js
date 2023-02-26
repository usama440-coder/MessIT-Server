const mongoose = require("mongoose");

const MenuSchema = mongoose.Schema({
  day: {
    type: String,
    enum: {
      values: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      message: "Value is not supported",
    },
    required: true,
  },

  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MealType",
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
    },
  ],
});

module.exports = mongoose.model("Menu", MenuSchema);
