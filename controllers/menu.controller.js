const Item = require("../models/Item.model");
const MealType = require("../models/MealType.model");
const Menu = require("../models/Menu.modal");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");

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

module.exports = {
  createMenu,
};
