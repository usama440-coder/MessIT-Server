const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Meal = require("../models/Meal.model");
const UserMeal = require("../models/UserMeal.model");
const Item = require("../models/Item.model");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Open a User Meal
// @route   POST /api/v1/userMeal/:id
// @access  User
const openMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { isOpen, items } = req.body;
  const date = new Date();

  // required fields validator not used
  // it is boolean
  if (isOpen !== true && isOpen !== false) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  // items array must contain atleast one element
  if (items.length == 0) {
    res.status(400);
    throw new Error("Please add atleast one item");
  }

  // user exists
  const userExists = await User.findOne({ _id: req.user.id });
  if (!checkRequiredFields(userExists)) {
    res.status(400);
    throw new Error("User not found");
  }

  // meal exists
  // user's mess == meal's mess
  const mealExists = await Meal.findOne({ _id, mess: req.user.mess });
  if (!checkRequiredFields(mealExists)) {
    res.status(400);
    throw new Error("Meal not found");
  }

  // item exists
  // pull item ids from meal
  const mealExistsItems = mealExists.items.map((item) =>
    item.itemId.toString()
  );
  for (const item of items) {
    if (!mealExistsItems.includes(item.itemId.toString())) {
      res.status(400);
      throw new Error("Item not found");
    }
  }

  // check closing time is not passed
  if (mealExists.closingTime < date) {
    res.status(400);
    throw new Error("Meal closed");
  }

  //   put entry in collection if open
  //   else delete that entry
  if (isOpen === true) {
    // if user already in collection
    // update items quantity else create a new one
    const userExists = await UserMeal.findOne({ user: req.user.id, meal: _id });
    if (userExists) {
      await UserMeal.updateOne({ user: req.user.id, meal: _id }, { items });
      res.status(200).json({ success: true, message: "User meal updated" });
    } else {
      const userMeal = await UserMeal.create({
        user: req.user.id,
        meal: _id,
        items,
      });
      res.status(200).json({ success: true, userMeal });
    }
  } else {
    // user exists in current meal
    const userExists = await UserMeal.findOne({ user: req.user.id, meal: _id });
    if (!checkRequiredFields(userExists)) {
      res.status(400);
      throw new Error("User not found for the current meal");
    }

    // delete user entry
    await UserMeal.deleteOne({ user: req.user.id, meal: _id });
    res
      .status(200)
      .json({ success: true, message: "User meal deleted successfully" });
  }
});

module.exports = {
  openMeal,
};
