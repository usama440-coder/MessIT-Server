const Mess = require("../models/Mess.model");
const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Create a mess
// @route   POST /api/v1/mess
// @access  Admin
const createMess = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!checkRequiredFields(name)) {
    res.status(400);
    throw new Error("Please enter a mess name");
  }

  // check if mess already exists
  const isExists = await Mess.findOne({ name });
  if (isExists) {
    res.status(409);
    throw new Error("Mess already exists");
  }

  // create a mess
  const mess = await Mess.create({
    name,
  });

  res.status(201).json({ success: true, mess });
});

// @desc    Get mess
// @route   GET /api/v1/mess
// @access  Admin
const getMess = asyncHandler(async (req, res) => {
  const mess = await Mess.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "mess",
        as: "result",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        totalUsers: {
          $size: "$result",
        },
      },
    },
  ]);

  res.status(200).json({ success: true, mess });
});

// @desc    Delete mess
// @route   DELETE /api/v1/mess/:id
// @access  Admin
const deleteMess = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  // check if mess exists
  const mess = await Mess.findOne({ _id });
  if (!checkRequiredFields(mess)) {
    res.status(400);
    throw new Error("Mess does not exists");
  }

  await Mess.deleteOne({ _id });

  res.status(200).json({ success: true, message: "Mess deleted successfully" });
});

// @desc    Update mess
// @route   PUT /api/v1/mess/:id
// @access  Admin
const updateMess = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // check field is given
  if (!name) {
    res.status(400);
    throw new Error("Please provide required field");
  }

  const _id = req.params.id;

  // check if mess exists
  const mess = await Mess.findOne({ _id });
  if (!checkRequiredFields(mess)) {
    res.status(400);
    throw new Error("Mess does not exists");
  }

  await Mess.updateOne({ _id }, { name });

  res.status(200).json({ success: true, message: "Mess Updated successfully" });
});

// @desc    Get a single mess
// @route   GET /api/v1/mess/:id
// @access  User
const getAMess = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const mess = await Mess.findOne({ _id });

  // mess exists
  if (!mess) {
    res.status(400);
    throw new Error("Mess not found");
  }

  res.status(200).json({ success: true, mess });
});

module.exports = {
  createMess,
  getMess,
  deleteMess,
  updateMess,
  getAMess,
};
