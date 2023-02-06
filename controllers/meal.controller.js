const Meal = require("../models/Meal.model");
const Mess = require("../models/Mess.model");
const Item = require("../models/Item.model");
const User = require("../models/User.model");
const MealType = require("../models/MealType.model");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Create a new meal
// @route   POST /api/v1/meal
// @access  Admin, Staff (own mess only)
const createMeal = asyncHandler(async (req, res) => {
  const { type, validFrom, validUntil, closingTime, mess, items } = req.body;

  // required fields
  if (
    !checkRequiredFields(type, validFrom, validUntil, closingTime, mess, items)
  ) {
    res.status(200);
    throw new Error("Required values not provided");
  }

  // items array must contain one element
  if (items.length == 0) {
    res.status(400);
    throw new Error("Please enter atleast one item");
  }

  // staff can add meal to its own mess only
  if (req.user.role === "staff" && req.user.mess.toString() !== mess) {
    res.status(400);
    throw new Error("You can add meal to your mess only");
  }

  // meal type exists and mess exist
  const mealTypeExists = await MealType.findOne({ type, mess });
  if (!checkRequiredFields(mealTypeExists)) {
    res.status(404);
    throw new Error("Meal type not found for this mess");
  }

  // items exists
  for (const item of items) {
    let itemExists = await Item.findOne({ _id: item.itemId, mess });
    if (!checkRequiredFields(itemExists)) {
      res.status(404);
      throw new Error("Item not found");
    }
  }

  const meal = await Meal.create({
    type,
    validFrom,
    validUntil,
    closingTime,
    mess,
    items,
  });

  res.status(200).json({ success: true, meal });
});

// @desc    Get all meals
// @route   GET /api/v1/meal
// @access  User (for its mess), Admin
const getMeals = asyncHandler(async (req, res) => {
  let currentMeals;
  let prevMeals;
  const date = new Date();

  // user can access meals of its own mess only
  if (req.user.role !== "admin") {
    currentMeals = await Meal.find({
      mess: req.user.mess,
      validUntil: { $gte: date },
    });
    prevMeals = await Meal.find({
      mess: req.user.mess,
      validUntil: { $lt: date },
    });
  } else {
    currentMeals = await Meal.find({
      validUntil: { $gte: date },
    });
    prevMeals = await Meal.find({
      validUntil: { $lt: date },
    });
  }

  res.status(200).json({ success: true, currentMeals, prevMeals });
});

// @desc    Get a meal
// @route   GET /api/v1/meal/:id
// @access  User (for its mess), Admin
const getMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let meal;

  // User can access meal of its own mess
  if (req.user.role !== "admin") {
    meal = await Meal.findOne({ _id, mess: req.user.mess });
  } else {
    meal = await Meal.findOne({ _id });
  }

  if (!checkRequiredFields(meal)) {
    res.status(404);
    throw new Error("Meal not found");
  }

  res.status(200).json({ success: true, meal });
});

// @desc    Update a meal
// @route   PUT /api/v1/meal/:id
// @access  Admin, Staff (own mess only)
const updateMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { type, validFrom, validUntil, closingTime, items } = req.body;
  let mealExists;

  // Meal exists
  if (req.user.role !== "admin") {
    mealExists = await Meal.findOne({ _id, mess: req.user.mess });
  } else {
    mealExists = await Meal.findOne({ _id });
  }
  if (!mealExists) {
    res.status(400);
    throw new Error("Meal not found");
  }

  // meal type exists
  // for admin (current meal's mess id)
  // for staff (its own mess)
  if (type) {
    let mealTypeExists;
    if (req.user.role !== "admin") {
      mealTypeExists = await MealType.findOne({ type, mess: req.user.mess });
    } else {
      mealTypeExists = await MealType.findOne({ type, mess: mealExists.mess });
    }

    if (!mealTypeExists) {
      res.status(400);
      throw new Error("Meal type not found");
    }
  }

  // items exists
  // staff -- only add items of its mess
  // admin -- add items of current meal's mess == item's mess
  if (items) {
    let itemExists;
    // items array must contain one element
    if (items.length == 0) {
      res.status(400);
      throw new Error("Please enter atleast one item");
    }

    // items exist
    for (const item of items) {
      if (req.user.role !== "admin") {
        itemExists = await Item.findOne({
          _id: item.itemId,
          mess: req.user.mess,
        });
      } else {
        itemExists = await Item.findOne({
          _id: item.itemId,
          mess: mealExists.mess,
        });
      }
      if (!checkRequiredFields(itemExists)) {
        res.status(404);
        throw new Error("Item not found");
      }
    }
  }

  await Meal.updateOne(
    { _id },
    { type, validFrom, validUntil, closingTime, items }
  );

  res.status(200).json({ success: true, message: "Meal updated successfully" });
});

// @desc    Delete a meal
// @route   DELETE /api/v1/meal/:id
// @access  Admin, Staff (own mess only)
const deleteMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let meal;

  // staff -- own mess
  // admin -- all
  if (req.user.role !== "admin") {
    meal = await Meal.findOne({ _id, mess: req.user.mess });
  } else {
    meal = await Meal.findOne({ _id });
  }

  if (!checkRequiredFields(meal)) {
    res.status(404);
    throw new Error("Meal not found");
  }

  await Meal.deleteOne({ _id });

  res.status(200).json({ success: true, message: "Meal deleted successfully" });
});

module.exports = {
  createMeal,
  getMeals,
  updateMeal,
  getMeal,
  deleteMeal,
};
