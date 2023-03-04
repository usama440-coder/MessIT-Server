const Item = require("../models/Item.model");
const MealType = require("../models/MealType.model");
const Menu = require("../models/Menu.modal");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");
const mongoose = require("mongoose");

// @desc    Add a menu
// @route   POST /api/v1/menu
// @access  Secretary
const createMenu = asyncHandler(async (req, res) => {
  const { day, type, items } = req.body;

  // check required fields
  if (!checkRequiredFields(day, type, items)) {
    res.status(400);
    throw new Error("Required fields not provided");
  }

  // items array should have atleast one item
  if (items.length === 0) {
    res.status(400);
    throw new Error("Provide atleast one item");
  }

  // menu already exists for day and type
  const menuExists = await Menu.findOne({ day, type, mess: req.user.mess });
  if (menuExists) {
    res.status(400);
    throw new Error("Menu already exists");
  }

  // meal type exists
  const mealType = await MealType.findOne({ _id: type, mess: req.user.mess });
  if (!mealType) {
    res.status(400);
    throw new Error("Item type not found");
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

  const menu = await Menu.create({
    day,
    type,
    items,
    mess: req.user.mess,
  });

  res.status(201).json({ success: true, menu });
});

// @desc    Get a menu
// @route   GET /api/v1/menu
// @access  User (own mess only)
const getMenu = asyncHandler(async (req, res) => {
  const menu = await Menu.aggregate([
    {
      $match: {
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
        as: "itemData",
      },
    },
    {
      $unwind: {
        path: "$itemData",
      },
    },
    {
      $group: {
        _id: "$_id",
        items: {
          $push: "$itemData",
        },
        day: {
          $first: "$day",
        },
        type: {
          $first: "$type",
        },
      },
    },
    {
      $lookup: {
        from: "mealtypes",
        localField: "type",
        foreignField: "_id",
        as: "typeData",
      },
    },
    {
      $unwind: {
        path: "$typeData",
      },
    },
    {
      $project: {
        _id: 1,
        items: 1,
        day: 1,
        "type._id": "$typeData._id",
        "type.type": "$typeData.type",
      },
    },
  ]);

  res.status(200).json({ success: true, menu });
});

// @desc    Update a menu
// @route   PUT /api/v1/menu/:id
// @access  Secretary (own mess only)
const updateMenu = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const { day, items, type } = req.body;

  // menu Exists
  const menuExist = await Menu.findOne({ _id, mess: req.user.mess });
  if (!menuExist) {
    res.status(400);
    throw new Error("Menu not found");
  }

  // meal type exists
  if (type) {
    const mealTypeExists = await MealType.findOne({
      _id: type,
      mess: req.user.mess,
    });

    if (!mealTypeExists) {
      res.status(400);
      throw new Error("Meal type not found");
    }
  }

  // items exist
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
        mess: req.user.mess,
      });
      if (!checkRequiredFields(itemExists)) {
        res.status(404);
        throw new Error("Item not found");
      }
    }
  }

  await Menu.updateOne({ _id }, { day, items, type });

  res.status(200).json({ success: true, message: "Menu updated successfully" });
});

// @desc    Delete a menu
// @route   DELETE /api/v1/menu/:id
// @access  Secretary (own mess only)
const deleteMenu = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  // menu Exists
  const menuExists = await Menu.findOne({ _id, mess: req.user.mess });
  if (!menuExists) {
    res.status(400);
    throw new Error("Menu not found");
  }

  await Menu.deleteOne({ _id });

  res.status(200).json({ success: true, message: "Menu deleted successfully" });
});

module.exports = {
  createMenu,
  getMenu,
  updateMenu,
  deleteMenu,
};
