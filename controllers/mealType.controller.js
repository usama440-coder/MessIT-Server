const MealType = require("../models/MealType.model");
const Mess = require("../models/Mess.model");
const asyncHandler = require("express-async-handler");
const {
  checkRequiredFields,
  addMealTypeValidator,
} = require("../utils/validator");

// @desc    Add a meal type
// @route   POST /api/v1/mealType
// @access  Secretary, Staff -- (own mess), Admin
const addMealType = asyncHandler(async (req, res) => {
  const { type, mess } = req.body;

  // check if type given
  if (!checkRequiredFields(type, mess)) {
    res.status(400);
    throw new Error("Meal type not provided");
  }

  // validation
  if (!addMealTypeValidator(type)) {
    res.status(400);
    throw new Error("Invalid value");
  }

  // mess Exists
  const messExists = await Mess.findOne({ _id: mess });
  if (!messExists) {
    res.status(400);
    throw new Error("Mess not found");
  }

  // Sec, Staff can add item of its own mess
  // admin can do it for all
  if (
    ["secretary", "staff"].includes(req.user.role) &&
    req.user.mess.toString() !== mess
  ) {
    res.status(400);
    throw new Error("You can Meal Type to your mess only");
  }

  // check if type already exists
  const isExist = await MealType.findOne({ type, mess });
  if (isExist) {
    res.status(400);
    throw new Error("Meal type already exists");
  }

  const mealType = await MealType.create({
    type,
    mess,
  });

  res.status(200).json({ success: true, mealType });
});

// @desc    Get all meal types
// @route   GET /api/v1/mealType
// @access  User (own mess), Admin
const getMealTypes = asyncHandler(async (req, res) => {
  let mealTypes;

  // excluding admin, meal type accessible to own mess
  if (req.user.role !== "admin") {
    mealTypes = await MealType.find({ mess: req.user.mess });
  } else {
    mealTypes = await MealType.find();
  }

  res.status(200).json({ success: true, mealTypes });
});

// @desc    Delete a meal type
// @route   DELETE /api/v1/mealType/:id
// @access  Admin, Secretary (own mess), Staff (own mess)
const deleteMealType = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let mealType;

  // Sec, Staff can delete item of their own mess
  // admin has rights to delete any item in any mess
  if (["secretary", "staff"].includes(req.user.role)) {
    mealType = await MealType.findOne({ _id, mess: req.user.mess });
  } else {
    mealType = await MealType.findOne({ _id });
  }

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
// @access  Admin, Secretary (own mess), Staff (own mess)
const updateMealType = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { type } = req.body;
  let mealType;

  // check required field
  if (!checkRequiredFields(type)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  // Sec, Staff can delete item of their own mess
  // admin has rights to delete any item in any mess
  if (["secretary", "staff"].includes(req.user.role)) {
    mealType = await MealType.findOne({ _id, mess: req.user.mess });
  } else {
    mealType = await MealType.findOne({ _id });
  }

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
