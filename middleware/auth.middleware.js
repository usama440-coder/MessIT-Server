const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

// function -- token verification
const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ _id: decoded.id }).select("-password");
    next();
  } catch (error) {
    res.status(400);
    throw new Error("Not Authorized");
  }
});

// Roles
const permit = (...roles) => {
  // return a middleware
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(400);
      throw new Error("You are not authenticated");
    }
  };
};

module.exports = {
  protect,
  permit,
};
