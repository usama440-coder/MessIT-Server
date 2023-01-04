const mongoose = require("mongoose");
const Item = require("../models/Item.model");

const MealSchema = mongoose.Schema({
  // type: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "MealType",
  //   required: true,
  // },
  // validFrom: {
  //   type: Date,
  //   required: true,
  // },
  // validUntil: {
  //   type: Date,
  //   required: true,
  // },
  // closingTime: {
  //   type: Date,
  //   required: true,
  // },
  // mess: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Mess",
  //   required: true,
  // },
  items: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
      units: Number,
    },
  ],
});

module.exports = mongoose.model("Meal", MealSchema);
