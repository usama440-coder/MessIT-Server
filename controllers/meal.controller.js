const Meal = require("../models/Meal.model");
const Item = require("../models/Item.model");
const MealType = require("../models/MealType.model");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { checkRequiredFields } = require("../utils/validator");
const UserMeal = require("../models/UserMeal.model");

// @desc    Create a new meal
// @route   POST /api/v1/meal
// @access  Staff (own mess only)
const createMeal = asyncHandler(async (req, res) => {
  const { type, validFrom, validUntil, closingTime, items } = req.body;

  // required fields
  if (!checkRequiredFields(type, validFrom, validUntil, closingTime, items)) {
    res.status(400);
    throw new Error("Required values not provided");
  }

  // items array must contain one element
  if (items.length == 0) {
    res.status(400);
    throw new Error("Please enter atleast one item");
  }

  // meal type exists and mess exist
  const mealTypeExists = await MealType.findOne({ type, mess: req.user.mess });
  if (!checkRequiredFields(mealTypeExists)) {
    res.status(404);
    throw new Error("Meal type not found for this mess");
  }

  // items exists
  for (const item of items) {
    let itemExists = await Item.findOne({
      _id: item.itemId,
      mess: req.user.mess,
    });
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
    mess: req.user.mess,
    items,
  });

  res.status(200).json({ success: true, meal });
});

// @desc    Get current meals
// @route   GET /api/v1/meal/current
// @access  Secretary, Staff, User
const getCurrentMeals = asyncHandler(async (req, res) => {
  const date = new Date();

  // user can access meals of its own mess only
  const currentMeals = await Meal.aggregate([
    {
      $match: {
        mess: req.user.mess,
        validUntil: { $gte: date },
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "items.itemId",
        foreignField: "_id",
        as: "itemsData",
      },
    },
    {
      $unwind: {
        path: "$itemsData",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$itemsData",
        },
        type: {
          $first: "$type",
        },
        validFrom: {
          $first: "$validFrom",
        },
        validUntil: {
          $first: "$validUntil",
        },
        closingTime: {
          $first: "$closingTime",
        },
        mess: {
          $first: "$mess",
        },
      },
    },
    {
      $lookup: {
        from: "usermeals",
        localField: "_id",
        foreignField: "meal",
        as: "mealData",
      },
    },
    {
      $project: {
        _id: 1,
        items: 1,
        type: 1,
        validFrom: 1,
        validUntil: 1,
        closingTime: 1,
        mess: 1,
        totalUsers: {
          $size: "$mealData",
        },
      },
    },
    {
      $sort: {
        validUntil: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, currentMeals });
});

// @desc    Get previous meals
// @route   GET /api/v1/meal/previous
// @access  Secretary, Staff, User
const getPreviousMeals = asyncHandler(async (req, res) => {
  const date = new Date();

  // pagination
  const page = parseInt(req.query.page || "0");
  const pageSize = parseInt(req.query.pageSize || "50");
  const total = await UserMeal.find({ user: req.user._id }).count();

  // user can access meals of its own mess only
  const previousMeals = await Meal.aggregate([
    {
      $match: {
        mess: req.user.mess,
        validUntil: { $lt: date },
      },
    },
    {
      $lookup: {
        from: "usermeals",
        localField: "_id",
        foreignField: "meal",
        as: "mealData",
      },
    },
    {
      $project: {
        _id: 1,
        items: 1,
        type: 1,
        validFrom: 1,
        validUntil: 1,
        closingTime: 1,
        mess: 1,
        totalUsers: {
          $size: "$mealData",
        },
      },
    },
    {
      $sort: {
        validUntil: -1,
      },
    },
    {
      $skip: pageSize * page,
    },
    {
      $limit: pageSize,
    },
  ]);

  res.status(200).json({
    success: true,
    previousMeals,
    totalPages: Math.ceil(total / pageSize),
  });
});

// @desc    Get a meal
// @route   GET /api/v1/meal/:id
// @access  Secretary, Staff, User
const getMeal = asyncHandler(async (req, res) => {
  // const _id = req.params.id;
  const id = mongoose.Types.ObjectId(req.params.id);

  // User can access meal of its own mess
  const meal = await Meal.aggregate([
    {
      $match: {
        _id: id,
        mess: mongoose.Types.ObjectId(req.user.mess),
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "items.itemId",
        foreignField: "_id",
        as: "itemsData",
      },
    },
    {
      $unwind: {
        path: "$itemsData",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$itemsData",
        },
        type: {
          $first: "$type",
        },
        validFrom: {
          $first: "$validFrom",
        },
        validUntil: {
          $first: "$validUntil",
        },
        closingTime: {
          $first: "$closingTime",
        },
        type: {
          $first: "$type",
        },
        createdAt: {
          $first: "$createdAt",
        },
      },
    },
  ]);
  // const meal = await Meal.findOne({ _id, mess: req.user.mess });

  if (!checkRequiredFields(meal)) {
    res.status(404);
    throw new Error("Meal not found");
  }

  res.status(200).json({ success: true, meal });
});

// @desc    Update a meal
// @route   PUT /api/v1/meal/:id
// @access  Staff
const updateMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { type, validFrom, validUntil, closingTime, items } = req.body;

  // Meal exists
  const mealExists = await Meal.findOne({ _id, mess: req.user.mess });

  if (!mealExists) {
    res.status(400);
    throw new Error("Meal not found");
  }

  // meal type exists
  if (type) {
    const mealTypeExists = await MealType.findOne({
      type,
      mess: mealExists.mess,
    });

    if (!mealTypeExists) {
      res.status(400);
      throw new Error("Meal type not found");
    }
  }

  // items exists
  // staff -- only add items of its mess
  if (items) {
    let itemExists;
    // items array must contain one element
    if (items.length == 0) {
      res.status(400);
      throw new Error("Please enter atleast one item");
    }

    // items exist
    for (const item of items) {
      itemExists = await Item.findOne({
        _id: item.itemId,
        mess: mealExists.mess,
      });
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
// @access  Staff (own mess only)
const deleteMeal = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const meal = await Meal.findOne({ _id, mess: req.user.mess });

  if (!checkRequiredFields(meal)) {
    res.status(404);
    throw new Error("Meal not found");
  }

  // delete meal will cause usermeal as well
  await Meal.deleteOne({ _id });
  await UserMeal.deleteOne({ meal: _id });

  res.status(200).json({ success: true, message: "Meal deleted successfully" });
});

module.exports = {
  createMeal,
  getCurrentMeals,
  getPreviousMeals,
  updateMeal,
  getMeal,
  deleteMeal,
};
