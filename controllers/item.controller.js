const Item = require("../models/Item.model");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields, addItemValidator } = require("../utils/validator");

// @desc    Add an item
// @route   POST /api/v1/items
// @access  Secretary(own mess only)
const addItem = asyncHandler(async (req, res) => {
  const { name, units } = req.body;

  // check fields are given
  if (!checkRequiredFields(name, units)) {
    res.status(400);
    throw new Error("Name or unit not provided");
  }

  // validation
  if (!addItemValidator(name, units)) {
    res.status(400);
    throw new Error("Invalid values for name and units");
  }

  //   item already exists for the user's mess
  const isExist = await Item.findOne({ name, mess: req.user.mess });
  if (isExist) {
    res.status(400);
    throw new Error("Item already exists");
  }

  const item = await Item.create({
    name,
    units,
    mess: req.user.mess,
  });
  res.status(201).json({ success: true, item });
});

// @desc    Get all items
// @route   GET /api/v1/items
// @access  All except Admin
const getItems = asyncHandler(async (req, res) => {
  const items = await Item.aggregate([
    {
      $match: {
        mess: req.user.mess,
      },
    },
    {
      $lookup: {
        from: "messes",
        localField: "mess",
        foreignField: "_id",
        as: "messData",
      },
    },
    {
      $unwind: {
        path: "$messData",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        units: 1,
        createdAt: 1,
        updatedAt: 1,
        "messData._id": "$messData._id",
        "messData.name": "$messData.name",
      },
    },
  ]);

  res.status(200).json({ success: true, items });
});

// @desc    Get a single item
// @route   GET /api/v1/items/:id
// @access  All except Admin
const getItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const item = await Item.findOne({ _id, mess: req.user.mess });

  if (!checkRequiredFields(item)) {
    res.status(400);
    throw new Error("Item not found");
  }

  res.status(200).json({ success: true, item });
});

// @desc    Delete a single item
// @route   DELETE /api/v1/items/:id
// @access  Secretary (own mess only)
const deleteItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const item = await Item.findOne({ _id, mess: req.user.mess });

  // item exists
  if (!checkRequiredFields(item)) {
    res.status(400);
    throw new Error("Item not found");
  }

  await Item.deleteOne({ _id });

  res.status(200).json({ success: true, message: "Item deleted successfully" });
});

// @desc    Update an item
// @route   PUT /api/v1/items/:id
// @access  Secretary (own mess)
const updateItem = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  const { name, units } = req.body;

  // fields are given
  if (!checkRequiredFields(name) && !checkRequiredFields(units)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  const item = await Item.findOne({ _id, mess: req.user.mess });
  // item exists
  if (!item) {
    res.status(400);
    throw new Error("Item does not exist");
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
