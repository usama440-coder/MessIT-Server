const asyncHandler = require("express-async-handler");
const Bill = require("../models/Bill.model");
const UserMeal = require("../models/UserMeal.model");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Generate bill all users
// @route   POST /api/v1/bill
// @access  Cashier, Admin
const generateBills = asyncHandler(async (req, res) => {
  const { from, to, unitCost, additionalCharges } = req.body;
  const cashier = "63d8c1ef21280c0d150245e1";

  // check required fields
  if (!checkRequiredFields(from, to, unitCost, additionalCharges)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  const billsData = await UserMeal.aggregate([
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
        meal: 1,
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
        additionalCharges: {
          $literal: additionalCharges,
        },
        from: {
          $literal: from,
        },
        to: {
          $literal: to,
        },
        unitCost: {
          $literal: unitCost,
        },
        netAmount: {
          $add: [{ $multiply: ["$totalUnits", unitCost] }, additionalCharges],
        },
        cashier: {
          $literal: cashier,
        },
      },
    },
  ]);

  const bills = await Bill.insertMany(billsData);

  res.status(200).json({ success: true, bills });
});

module.exports = { generateBills };
