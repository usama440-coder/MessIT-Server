const User = require("../models/User.model");
const asyncHandler = require("express-async-handler");
const {
  registerUserValidator,
  checkRequiredFields,
} = require("../utils/validator");

// @desc    Register user
// @route   POST /api/v1/users
// @access  Admin
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, isActive, role, profile } = req.body;

  // required fields validation
  if (!checkRequiredFields(name, email)) {
    res.status(400);
    throw new Error("Provide all the fields");
  }

  //   validation
  if (!registerUserValidator(name, email)) {
    res.status(400);
    throw new Error("Invalid name or email");
  }

  //   check if already exists
  const isExist = await User.findOne({ email });
  if (isExist) {
    res.status(409);
    throw new Error("User already exists");
  }

  //   register
  const user = await User.create({
    name,
    email,
    isActive,
    role,
    profile,
    mess: "63b04b814c7352eb92c3ef64", //temporary
  });

  res.status(201).json({ success: true, user });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

// @desc    Get a user
// @route   GET /api/v1/users/:id
// @access  all
const getUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const user = await User.findOne({ _id });

  if (!checkRequiredFields(user)) {
    res.status(400);
    throw new Error("No User Found");
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Delete a user
// @route   DELETE /api/v1/users
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const user = await User.findOne({ _id });

  if (!checkRequiredFields(user)) {
    res.status(400);
    throw new Error("User not found");
  }

  await User.deleteOne({ _id });

  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// @desc    Update a user
// @route   PUT /api/v1/users
// @access  Admin (password exclude), User (just password)
const updateUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  const { name, email, isActive, role, mess, profile } = req.body;

  const user = await User.findOne({ _id });

  if (!checkRequiredFields(user)) {
    res.status(400);
    throw new Error("User not found");
  }

  await User.updateOne({ _id }, { name, email, isActive, role, mess, profile });

  res.status(200).json({ success: true, message: "User updated successfully" });
});

module.exports = {
  registerUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
};
