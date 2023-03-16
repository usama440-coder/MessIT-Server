const User = require("../models/User.model");
const Mess = require("../models/Mess.model");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  registerUserValidator,
  checkRequiredFields,
  checkUserRoles,
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

    const mess = await Mess.findOne({ _id: user.mess }).select("name");

    res.status(200).json({ success: true, user, mess, token });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register user
// @route   POST /api/v1/users
// @access  Admin
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, isActive, role, profile, mess, contact } = req.body;

  // required fields validation
  if (!checkRequiredFields(name, email, mess, contact, role)) {
    res.status(400);
    throw new Error("Provide all the fields");
  }

  // roles
  const curr_roles = ["user", "staff", "cashier", "secretary"];
  if (role.length === 0 || !role.every((val) => curr_roles.includes(val))) {
    res.status(400);
    throw new Error("Invalid role value");
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
  const hashedPassword = bcrypt.hashSync("123456", salt);

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

  // pagination
  const page = parseInt(req.query.page || "0");
  const pageSize = parseInt(req.query.pageSize || "50");
  const total = await User.countDocuments({});
  const mess = req.query.mess || "";

  if (mess !== "") {
    users = await User.aggregate([
      {
        $match: {
          mess: mongoose.Types.ObjectId(mess),
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
          contact: 1,
          createdAt: 1,
          "messData._id": "$messData._id",
          "messData.name": "$messData.name",
        },
      },
      {
        $skip: pageSize * page,
      },
      {
        $limit: pageSize,
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
          "messData._id": "$messData._id",
          "messData.name": "$messData.name",
        },
      },
      {
        $skip: pageSize * page,
      },
      {
        $limit: pageSize,
      },
    ]);
  }

  res
    .status(200)
    .json({ success: true, users, totalPages: Math.ceil(total / pageSize) });
});

// @desc    Get a user
// @route   GET /api/v1/users/:id
// @access  Sec, Cashier, Staff --> (own mess), Admin
//          User (own profile only)
const getUser = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let user;
  const user_roles = req.user.role;

  // Sec, Cashier, Staff can read user of their own mess
  // User can view profile of its own
  if (checkUserRoles(user_roles, ["secretary", "cashier", "staff"])) {
    user = await User.findOne({ _id, mess: req.user.mess }).select("-password");
  } else if (checkUserRoles(user_roles, ["user"])) {
    user = await User.findOne({ _id: req.user.id }).select("-password");
  } else {
    user = await User.findOne({ _id }).select("-password");
  }

  if (!checkRequiredFields(user)) {
    res.status(400);
    throw new Error("No User Found");
  }

  const mess = await Mess.findOne({ _id: user.mess }).select("name");

  res.status(200).json({
    success: true,
    data: {
      user,
      mess,
    },
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
  const role = req.body.role;

  if (req.body.role) {
    const curr_roles = ["user", "staff", "cashier", "secretary"];
    if (role.length === 0 || !role.every((val) => curr_roles.includes(val))) {
      res.status(400);
      throw new Error("Invalid role value");
    }
  }

  // user exists
  const user = await User.findOne({ _id });
  if (!checkRequiredFields(user)) {
    res.status(400);
    throw new Error("User not found");
  }

  await User.updateOne({ _id }, req.body);

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
