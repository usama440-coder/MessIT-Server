const Meal = require("../models/Meal.model");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Create a new meal
// @route   POST /api/v1/meal
// @access  Admin, Staff
const createMeal = asyncHandler(async (req, res) => {
  //   const { type, validFrom, validUntil, closingTime, items } = req.body;

  // required fields
  //   if (!checkRequiredFields(type, validFrom, validUntil, closingTime)) {
  //     res.status(200);
  //     throw new Error("Required values not provided");
  //   }

  //   const item = await Item.findOne();

  const meal = await Meal.create({
    // type: "63b57af4360af8d42cda67f8",
    // validFrom: new Date(),
    // validUntil: new Date(),
    // closingTime: new Date(),
    // mess: "63b04b814c7352eb92c3ef64",
    items: [
      {
        _id: "63b57af4360af8d42cda67f8",
        name: "some name",
        units: 30,
      },
    ],
  });

  res.status(200).json({ success: true, meal });
});

module.exports = {
  createMeal,
};
