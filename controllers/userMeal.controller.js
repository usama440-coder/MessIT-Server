const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Meal = require("../models/Meal.model");
const UserMeal = require("../models/UserMeal.model");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Open a User Meal
// @route   POST /api/v1/userMeal/:id
// @access  User
const openMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const userId = "63d8c1d121280c0d150245de"; // temporary
  const { isOpen, items } = req.body;

  //   required fields validator not used
  // it is boolean
  if (isOpen !== true && isOpen !== false) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  // meal exists
  const mealExists = await Meal.findOne({ _id });
  if (!checkRequiredFields(mealExists)) {
    res.status(400);
    throw new Error("Meal not found");
  }

  // user exists
  const userExists = await User.findOne({ _id: userId });
  if (!checkRequiredFields(userExists)) {
    res.status(400);
    throw new Error("User not found");
  }

  //   put entry in collection if open
  //   else delete that entry
  if (isOpen === true) {
    // user already in collection
    // update items quantity else create a new one
    const userExists = await UserMeal.findOne({ user: userId, meal: _id });
    if (userExists) {
      await UserMeal.updateOne({ user: userId, meal: _id }, { items });
      res.status(200).json({ success: true, message: "User meal updated" });
    } else {
      const userMeal = await UserMeal.create({
        user: userId,
        meal: _id,
        items,
      });
      res.status(200).json({ success: true, userMeal });
    }
  } else {
    // user exists in current meal
    const userExists = await UserMeal.findOne({ user: userId, meal: _id });
    if (!checkRequiredFields(userExists)) {
      res.status(400);
      throw new Error("User not found for the current meal");
    }

    // delete user entry
    await UserMeal.deleteOne({ user: userId, meal: _id });
    res
      .status(200)
      .json({ success: true, message: "User meal deleted successfully" });
  }
});

// @desc    Update a User Meal
// @route   PUT /api/v1/userMeal/:id
// @access  User
const updateUserMeal = asyncHandler(async (req, res) => {});

module.exports = {
  openMeal,
};
