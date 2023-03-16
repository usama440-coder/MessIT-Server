const asyncHandler = require("express-async-handler");
const UserMeal = require("../models/UserMeal.model");
const Balance = require("../models/Balance.model");
const Bill = require("../models/Bill.model");
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
        user: req.user._id,
        $and: [
          {
            "mealData.createdAt": {
              $gte: new Date(from),
              $lte: new Date(to),
            },
          },
          {
            "mealData.mess": req.user.mess,
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "items.itemId",
        foreignField: "_id",
        as: "itemData",
      },
    },
    {
      $unwind: {
        path: "$itemData",
      },
    },
    {
      $project: {
        unitsPerItem: {
          $multiply: ["$items.itemQuantity", "$itemData.units"],
        },
        user: 1,
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$user",
        totalUnits: {
          $sum: "$unitsPerItem",
        },
        user: {
          $first: "$user",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalUnits: 1,
        user: 1,
        from: {
          $literal: from,
        },
        to: {
          $literal: to,
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
        $and: [
          {
            "mealData.createdAt": {
              $gte: new Date(from),
              $lte: new Date(to),
            },
          },
          {
            "mealData.mess": req.user.mess,
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$items",
      },
    },
    {
      $lookup: {
        from: "items",
        localField: "items.itemId",
        foreignField: "_id",
        as: "itemData",
      },
    },
    {
      $unwind: {
        path: "$itemData",
      },
    },
    {
      $project: {
        unitsPerItem: {
          $multiply: ["$items.itemQuantity", "$itemData.units"],
        },
        user: 1,
        _id: 0,
        mess: "$mealData.mess",
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
  const totalMeals = await UserMeal.aggregate([
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
        "mealData.createdAt": {
          $gte: new Date(from),
        },
      },
    },
    {
      $group: {
        _id: "$mealData.mess",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

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

module.exports = { getUserStats, getSecretaryStats, getCashierStats };
