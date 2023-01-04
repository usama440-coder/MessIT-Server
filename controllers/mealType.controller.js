const MealType = require("../models/MealType.model");
const asyncHandler = require("express-async-handler");
const {
  checkRequiredFields,
  addMealTypeValidator,
} = require("../utils/validator");

// @desc    Add a meal type
// @route   POST /api/v1/mealType
// @access  Admin, Secretary, Staff
const addMealType = asyncHandler(async (req, res) => {
  const { type } = req.body;

  // check if type given
  if (!checkRequiredFields(type)) {
    res.status(400);
    throw new Error("Meal type not provided");
  }

  // validation
  if (!addMealTypeValidator(type)) {
    res.status(400);
    throw new Error("Invalid value");
  }

  // check if type already exists
  const isExist = await MealType.findOne({ type });
  if (isExist) {
    res.status(400);
    throw new Error("Meal type already exists");
  }

  const mealType = await MealType.create({
    type,
    mess: "63b04b814c7352eb92c3ef64",
  });

  res.status(200).json({ success: true, mealType });
});

// @desc    Get all meal types
// @route   GET /api/v1/mealType
// @access  User
const getMealTypes = asyncHandler(async (req, res) => {
  const mealTypes = await MealType.find();

  res.status(200).json({ success: true, mealTypes });
});

// @desc    Delete a meal type
// @route   DELETE /api/v1/mealType/:id
// @access  Admin, Secretary, Staff
const deleteMealType = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const mealType = await MealType.findOne({ _id });

  //   meal type exists or not
  if (!checkRequiredFields(mealType)) {
    res.status(400);
    throw new Error("Meal type not found");
  }

  await MealType.deleteOne({ _id });

  res
    .status(200)
    .json({ success: true, message: "Meal type deleted successfully" });
});

// @desc    Update a meal type
// @route   PUT /api/v1/mealType/:id
// @access  Admin, Secretary, Staff
const updateMealType = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { type } = req.body;

  const mealType = await MealType.findOne({ _id });

  //   if meal type exists or not
  if (!checkRequiredFields(mealType)) {
    res.status(400);
    throw new Error("Meal type not found");
  }

  //   validation
  if (!addMealTypeValidator(type)) {
    res.status(400);
    throw new Error("Invalid value");
  }

  await MealType.updateOne({ _id }, { type });

  res
    .status(200)
    .json({ success: true, message: "Meal type updated successfully" });
});

module.exports = { addMealType, getMealTypes, deleteMealType, updateMealType };
