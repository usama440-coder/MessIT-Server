const User = require("../models/User.model");

// @desc    Register user
// @route   POST /api/v1/users
// @access  Admin
const registerUser = async (req, res) => {
  const { name, email, isActive, role, profile } = req.body;

  //   check required fields
  if (!name || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide required fields" });
  }

  //   validation
  if (
    name.length < 4 ||
    name.length > 100 ||
    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid name or email" });
  }

  //   check if already exists
  const isExist = await User.findOne({ email });
  if (isExist) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
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
};

module.exports = {
  registerUser,
};
