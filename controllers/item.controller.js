const Item = require("../models/Item.model");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields, addItemValidator } = require("../utils/validator");

// @desc    Add an item
// @route   POST /api/v1/items
// @access  Admin, Secretary
const addItem = asyncHandler(async (req, res) => {
  const { name, units } = req.body;

  // check fields are given
  if (!checkRequiredFields(name, units)) {
    res.status(400);
    throw new Error("Name or unit not provided");
  }

  //   item already exists
  const isExist = await Item.findOne({ name });
  if (isExist) {
    res.status(400);
    throw new Error("Item already exists");
  }

  // validation
  if (!addItemValidator(name, units)) {
    res.status(400);
    throw new Error("Invalid values for name and units");
  }

  const item = await Item.create({
    name,
    units,
    mess: "63b04b814c7352eb92c3ef64", //temporary
  });

  res.status(201).json({ success: true, item });
});

// @desc    Get all items
// @route   GET /api/v1/items
// @access  User
const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find();

  res.status(200).json({ success: true, items });
});

// @desc    Get a single item
// @route   GET /api/v1/items/:id
// @access  User
const getItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const item = await Item.find({ _id });

  if (!checkRequiredFields(item)) {
    res.status(400);
    throw new Error("Item not found");
  }

  res.status(200).json({ success: true, item });
});

// @desc    Delete a single item
// @route   DELETE /api/v1/items/:id
// @access  Admin, Secretary
const deleteItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const item = await Item.findOne({ _id });

  if (!checkRequiredFields(item)) {
    res.status(400);
    throw new Error("Item not found");
  }

  await Item.deleteOne({ _id });

  res.status(200).json({ success: true, message: "Item deleted successfully" });
});

// @desc    Update an item
// @route   PUT /api/v1/items/:id
// @access  Admin, Secretary
const updateItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { name, units } = req.body;

  const item = await Item.findOne({ _id });

  //   fields are given
  if (!checkRequiredFields(item)) {
    res.status(400);
    throw new Error("Item not found");
  }

  //   validation
  if (!addItemValidator(name, units)) {
    res.status(400);
    throw new Error("Invalid values");
  }

  await Item.updateOne({ _id }, { name, units });

  res.status(200).json({ success: true, message: "Item updated successfully" });
});

module.exports = {
  addItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
};