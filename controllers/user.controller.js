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
  const { name, email, isActive, role, profile, mess } = req.body;

  // required fields validation
  if (!checkRequiredFields(name, email, mess)) {
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
  });

  res.status(201).json({ success: true, user });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Admin

module.exports = {
  registerUser,
};
