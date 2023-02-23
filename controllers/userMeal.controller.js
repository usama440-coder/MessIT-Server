const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Meal = require("../models/Meal.model");
const UserMeal = require("../models/UserMeal.model");
const Item = require("../models/Item.model");
const mongoose = require("mongoose");
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
      res.status(200).json({ success: true, message: "User meal opened" });
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
    res.status(200).json({ success: true, message: "User meal closed" });
  }
});

// @desc    Get user meal
// @route   GET /api/v1/userMeal/:id
// @access  User(own meals only), Staff(all users)
const getUserMeal = asyncHandler(async (req, res) => {
  const _id = mongoose.Types.ObjectId(req.params.id);
  let userMeal;

  // user can access meal of its own
  if (req.user.role !== "staff") {
    userMeal = await UserMeal.aggregate([
      {
        $match: {
          meal: _id,
          user: req.user._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          meal: 1,
          items: 1,
          createdAt: 1,
          updatedAt: 1,
          "userData._id": 1,
          "userData.name": 1,
        },
      },
    ]);
  } else {
    userMeal = await UserMeal.aggregate([
      {
        $match: {
          meal: _id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          meal: 1,
          items: 1,
          createdAt: 1,
          updatedAt: 1,
          "userData._id": 1,
          "userData.name": 1,
        },
      },
    ]);
  }

  res.status(200).json({ success: true, userMeal });
});

// @desc    Update a User Meal
// @route   PUT /api/v1/userMeal/:id
// @access  Staff
const updateUserMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { items } = req.body;
  const date = new Date();

  // required fields
  if (!checkRequiredFields(items)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  // items array must contain atleast one element
  if (items.length == 0) {
    res.status(400);
    throw new Error("Please add atleast one item");
  }

  // user meal exist
  const userMealExists = await UserMeal.findOne({ _id });

  if (!userMealExists) {
    res.status(400);
    throw new Error("User meal not found");
  }

  // check validUntil time is not passed
  if (userMealExists.validUntil < date) {
    res.status(400);
    throw new Error("Meal closed");
  }

  // item exists
  // pull item ids from meal
  const mealExistsItems = userMealExists.items.map((item) =>
    item.itemId.toString()
  );
  for (const item of items) {
    if (!mealExistsItems.includes(item.itemId.toString())) {
      res.status(400);
      throw new Error("Item not found");
    }
  }

  await UserMeal.updateOne({ _id }, { items });
  res.status(200).json({ success: true, message: "User meal updated" });
});

// @desc    Get a single user meal
// @route   GET /api/v1/userMeal/user/:id
// @access  Staff
const getSingleUserMeal = asyncHandler(async (req, res) => {
  const _id = mongoose.Types.ObjectId(req.params.id);
  const { user } = req.body;

  // required field user
  if (!user) {
    res.status(400);
    throw new Error("Provide required fields");
  }

  const singleUserMeal = await UserMeal.aggregate([
    {
      $match: {
        meal: _id,
        user: mongoose.Types.ObjectId(user),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $unwind: {
        path: "$userData",
      },
    },
    {
      $project: {
        _id: 1,
        user: 1,
        meal: 1,
        items: 1,
        createdAt: 1,
        updatedAt: 1,
        "userData.name": 1,
        "userData.email": 1,
      },
    },
  ]);

  if (!singleUserMeal) {
    res.status(400);
    throw new Error("User meal not found");
  }

  res.status(200).json({ success: true, singleUserMeal });
});

// @desc    Get all user meals
// @route   GET /api/v1/userMeal
// @access  User (own meals only)
const getAllUserMeals = asyncHandler(async (req, res) => {
  const userMeals = await UserMeal.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "meals",
        localField: "meal",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $unwind: {
        path: "$mealData",
      },
    },
    {
      $project: {
        _id: 1,
        user: 1,
        createdAt: 1,
        updatedAt: 1,
        mealData: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, userMeals });
});

module.exports = {
  openMeal,
  getUserMeal,
  updateUserMeal,
  getSingleUserMeal,
  getAllUserMeals,
};
