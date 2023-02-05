const mongoose = require("mongoose");

const MealTypeSchema = mongoose.Schema({
  type: {
    type: String,
    min: [3, "Type should be atleast 3 characters"],
    max: [50, "Type should not be more than 50 characters"],
    required: [true, "Type not provided"],
  },
  mess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mess",
    required: true,
  },
});

module.exports = mongoose.model("MealType", MealTypeSchema);
