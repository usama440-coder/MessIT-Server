const User = require("../models/User.model");
const Mess = require("../models/Mess.model");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  registerUserValidator,
  checkRequiredFields,
} = require("../utils/validator");

// @desc    Login User
// @route   POST /api/v1/users/login
// @access  User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check required fields
  if (!checkRequiredFields(email, password)) {
    res.status(400);
    throw new Error("Please enter required fields");
  }

  const user = await User.findOne({ email });

  // user exists and password is correct
  if (user && (await bcrypt.compare(password, user.password))) {
    // generate token
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({ success: true, user, token });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register user
// @route   POST /api/v1/users
// @access  Admin
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, isActive, role, profile, password, mess, contact } =
    req.body;

  // required fields validation
  if (!checkRequiredFields(name, email, password, mess, contact)) {
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

  // mess exists
  const messExists = await Mess.findOne({ _id: mess });
  if (!messExists) {
    res.status(400);
    throw new Error("Mess not found");
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  //   register
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    isActive,
    role,
    profile,
    mess,
    contact,
  });

  res.status(201).json({ success: true, user });
});

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Sec, Staff, Cashier --> (own mess), Admin
const getUsers = asyncHandler(async (req, res) => {
  let users;

  // sec, cashier, staff can view users of their own mess only
  if (["secretary", "cashier", "staff"].includes(req.user.role)) {
    users = await User.aggregate([
      {
        $match: {
          mess: new ObjectId(req.user.mess),
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
          email: 1,
          isActive: 1,
          role: 1,
          createdAt: 1,
          contact: 1,
          messData: 1,
        },
      },
    ]);
  } else {
    users = await User.aggregate([
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
          email: 1,
          isActive: 1,
          role: 1,
          contact: 1,
          createdAt: 1,
          messData: 1,
        },
      },
    ]);
  }

  res.status(200).json({ success: true, users });
});

// @desc    Get a user
// @route   GET /api/v1/users/:id
// @access  Sec, Cashier, Staff --> (own mess), Admin
//          User (own profile only)
const getUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let user;

  // Sec, Cashier, Staff can read user of their own mess
  // User can view profile of its own
  if (["secretary", "cashier", "staff"].includes(req.user.role)) {
    user = await User.findOne({ _id, mess: req.user.mess }).select("-password");
  } else if (req.user.role === "user") {
    user = await User.findOne({ _id: req.user.id }).select("-password");
  } else {
    user = await User.findOne({ _id }).select("-password");
  }

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
// @access  Admin
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
  loginUser,
};
