const asyncHandler = require("express-async-handler");
const UserMeal = require("../models/UserMeal.model");
const Balance = require("../models/Balance.model");
const Bill = require("../models/Bill.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

// @desc    Get stats of user
// @route   GET /api/v1/stats/user
// @access  User
const getUserStats = asyncHandler(async (req, res) => {
  // units from first day of the current month
  const from = new Date();
  from.setDate(1);
  const to = new Date();

  const totalUnits = await UserMeal.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user._id),
        mess: mongoose.Types.ObjectId(req.user.mess),
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $project: {
        unitsPerItem: {
          $multiply: ["$items.itemQuantity", "$items.units"],
        },
        _id: 0,
        user: 1,
      },
    },
    {
      $group: {
        _id: "$user",
        totalUnits: {
          $sum: "$unitsPerItem",
        },
      },
    },
  ]);

  //   count documents from start of the month
  const totalMeals = await UserMeal.find({
    user: req.user._id,
    createdAt: { $gte: new Date(from) },
  }).count();

  //   user balance
  let balance = await Balance.findOne({ user: req.user._id }).select("balance");
  if (!balance) {
    balance = 0;
  }

  //   user bill for the last 5 months
  const bills = await Bill.find({ user: req.user._id })
    .sort({ to: -1 })
    .limit(6)
    .select("createdAt totalUnits netAmount");

  //  user meal type this month
  const mealTypes = await UserMeal.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(req.user._id),
        createdAt: {
          $gte: new Date(from),
        },
      },
    },
    {
      $lookup: {
        from: "meals",
        localField: "meal",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $unwind: {
        path: "$mealData",
      },
    },
    {
      $group: {
        _id: "$mealData.type",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  res
    .status(200)
    .json({ success: true, totalUnits, totalMeals, balance, bills, mealTypes });
});

// @desc    Get stats of secretary and staff
// @route   GET /api/v1/stats/seretary
// @access  Secretary
const getSecretaryStats = asyncHandler(async (req, res) => {
  // units from first day of the current month
  const from = new Date();
  from.setDate(1);
  const to = new Date();

  const totalUnits = await UserMeal.aggregate([
    {
      $match: {
        mess: mongoose.Types.ObjectId(req.user.mess),
        createdAt: {
          $gte: new Date(from),
          $lte: new Date(to),
        },
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $project: {
        unitsPerItem: {
          $multiply: ["$items.itemQuantity", "$items.units"],
        },
        _id: 0,
        mess: 1,
      },
    },
    {
      $group: {
        _id: "$mess",
        totalUnits: {
          $sum: "$unitsPerItem",
        },
      },
    },
  ]);

  //   count number of meals this month
  const totalMeals = await UserMeal.find({
    mess: req.user.mess,
    createdAt: { $gte: new Date(from) },
  }).count();

  //  user meal type this month
  const mealTypes = await UserMeal.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(from),
        },
      },
    },
    {
      $lookup: {
        from: "meals",
        localField: "meal",
        foreignField: "_id",
        as: "mealData",
      },
    },
    {
      $unwind: {
        path: "$mealData",
      },
    },
    {
      $match: {
        "mealData.mess": mongoose.Types.ObjectId(req.user.mess),
      },
    },
    {
      $group: {
        _id: "$mealData.type",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  //   get last 6 months total units
  const lastSixMonthsUnits = await Bill.aggregate([
    {
      $match: {
        mess: mongoose.Types.ObjectId(req.user.mess),
      },
    },
    {
      $group: {
        _id: {
          $month: "$to",
        },
        totalUnits: {
          $sum: "$totalUnits",
        },
        Month: {
          $first: "$to",
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  res.status(200).json({
    success: true,
    totalUnits,
    totalMeals,
    lastSixMonthsUnits,
    mealTypes,
  });
});

// @desc    Get stats of Cashier
// @route   GET /api/v1/stats/cashier
// @access  Cashier
const getCashierStats = asyncHandler(async (req, res) => {
  // units from first day of the current month
  const from = new Date();
  from.setDate(1);
  const to = new Date();

  //   get paid and unpaid bills
  const unpaidBills = await Bill.find({
    mess: req.user.mess,
    createdAt: { $gte: from },
    isPaid: false,
  }).count();
  const paidBills = await Bill.find({
    mess: req.user.mess,
    createdAt: { $gte: from },
    isPaid: true,
  }).count();

  //   get last 6 months total units and bills
  const lastSixMonthsBills = await Bill.aggregate([
    {
      $match: {
        mess: mongoose.Types.ObjectId(req.user.mess),
      },
    },
    {
      $group: {
        _id: {
          $month: "$to",
        },
        totalBill: {
          $sum: "$netAmount",
        },
        Month: {
          $first: "$to",
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $limit: 6,
    },
  ]);

  //   bill collected and bill remaining
  const collectedBill = await Bill.aggregate([
    {
      $match: {
        mess: mongoose.Types.ObjectId(req.user.mess),
        createdAt: {
          $gte: new Date(from),
        },
      },
    },
    {
      $group: {
        _id: "$isPaid",
        total: {
          $sum: "$netAmount",
        },
      },
    },
    {
      $project: {
        paidBill: "$_id",
        _id: 0,
        total: 1,
      },
    },
    {
      $sort: {
        paidBill: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    unpaidBills,
    paidBills,
    lastSixMonthsBills,
    collectedBill,
  });
});

// @desc    Get stats of Admin
// @route   GET /api/v1/stats/admin
// @access  Admin
const getAdminStats = asyncHandler(async (req, res) => {
  // get total users
  const totalUsers = await User.find({}).count();

  // get active and inactive users
  const activeUsers = await User.find({ isActive: true }).count();
  const inactiveUsers = await User.find({ isActive: false }).count();

  // get users by thier mess
  const usersMessData = await User.aggregate([
    {
      $group: {
        _id: "$mess",
        totalUsers: {
          $sum: 1,
        },
      },
    },
    {
      $lookup: {
        from: "messes",
        localField: "_id",
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
        mess: "$messData.name",
        totalUsers: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    totalUsers,
    activeUsers,
    inactiveUsers,
    usersMessData,
  });
});

module.exports = {
  getUserStats,
  getSecretaryStats,
  getCashierStats,
  getAdminStats,
};
