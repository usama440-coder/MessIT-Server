const asyncHandler = require("express-async-handler");
const Bill = require("../models/Bill.model");
const Balance = require("../models/Balance.model");
const User = require("../models/User.model");
const Mess = require("../models/Mess.model");
const UserMeal = require("../models/UserMeal.model");
const { checkRequiredFields } = require("../utils/validator");
const mongoose = require("mongoose");

// @desc    Generate bill all users
// @route   POST /api/v1/bill
// @access  Cashier (own mess)
const generateBills = asyncHandler(async (req, res) => {
  const { from, to } = req.body;
  const additionalCharges = parseInt(req.body.additionalCharges);
  const unitCost = parseFloat(req.body.unitCost);

  // check required fields
  if (!checkRequiredFields(from, to, unitCost, additionalCharges)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  const billsData = await UserMeal.aggregate([
    {
      $match: {
        $and: [
          {
            createdAt: {
              $gte: new Date(from),
              $lte: new Date(to),
            },
          },
          {
            mess: req.user.mess,
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
      $project: {
        unitsPerItem: {
          $multiply: ["$items.units", "$items.itemQuantity"],
        },
        user: 1,
        meal: 1,
        mess: 1,
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
        mess: {
          $first: "$mess",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalUnits: 1,
        user: 1,
        mess: 1,
        additionalCharges: {
          $literal: additionalCharges,
        },
        from: {
          $literal: new Date(from),
        },
        to: {
          $literal: new Date(to),
        },
        unitCost: {
          $literal: unitCost,
        },
        netAmount: {
          $add: [
            {
              $multiply: ["$totalUnits", unitCost],
            },
            additionalCharges,
          ],
        },
        cashier: {
          $literal: req.user.id,
        },
      },
    },
  ]);

  const bills = await Bill.insertMany(billsData);

  res.status(200).json({ success: true, bills });
});

// @desc    Get bills
// @route   GET /api/v1/bill
// @access  Cashier (all users of mess), User (own bill)
const getBills = asyncHandler(async (req, res) => {
  let bills;

  // pagination
  let total;
  const page = parseInt(req.query.page || "0");
  const pageSize = parseInt(req.query.pageSize || "50");
  let paid = req.query.paid || "";

  if (req.user.role.includes("cashier")) {
    total = await Bill.find({ mess: req.user.mess }).count();

    if (paid !== "") {
      paid = paid === "true";
      bills = await Bill.aggregate([
        {
          $match: {
            mess: mongoose.Types.ObjectId(req.user.mess),
            isPaid: paid,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $unwind: {
            path: "$userData",
          },
        },
        {
          $project: {
            _id: 1,
            from: 1,
            to: 1,
            totalUnits: 1,
            unitCost: 1,
            additionalCharges: 1,
            netAmount: 1,
            isPaid: 1,
            mess: 1,
            payment: 1,
            "user.name": "$userData.name",
            "user.id": "$userData._id",
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
      bills = await Bill.aggregate([
        {
          $match: {
            mess: mongoose.Types.ObjectId(req.user.mess),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userData",
          },
        },
        {
          $unwind: {
            path: "$userData",
          },
        },
        {
          $project: {
            _id: 1,
            from: 1,
            to: 1,
            totalUnits: 1,
            unitCost: 1,
            additionalCharges: 1,
            netAmount: 1,
            isPaid: 1,
            mess: 1,
            payment: 1,
            "user.name": "$userData.name",
            "user.id": "$userData._id",
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
  } else {
    total = await Bill.find({ user: req.user._id }).count();
    bills = await Bill.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: {
          path: "$userData",
        },
      },
      {
        $project: {
          _id: 1,
          from: 1,
          to: 1,
          totalUnits: 1,
          unitCost: 1,
          additionalCharges: 1,
          netAmount: 1,
          isPaid: 1,
          mess: 1,
          payment: 1,
          "user.name": "$userData.name",
          "user.id": "$userData._id",
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
    .json({ success: true, bills, totalPages: Math.ceil(total / pageSize) });
});

// @desc    Get a single bill
// @route   GET /api/v1/bill/:id
// @access  Cashier
const getBill = asyncHandler(async (req, res) => {
  const _id = req.params.id;

  // find bill
  const bill = await Bill.findOne({ _id, mess: req.user.mess });
  if (!bill) {
    res.status(404);
    throw new Error("Bill not found");
  }

  // find cashier, user and mess data
  const cashier = await User.findOne({ _id: bill.cashier }).select("name");
  const user = await User.findOne({ _id: bill.user }).select("name");
  const mess = await Mess.findOne({ _id: bill.mess }).select("name");

  if (!cashier || !user || !mess) {
    res.status(404);
    throw new Error("Cannot find data");
  }

  res.status(200).json({ bill, cashier, user, mess });
});

// @desc    Update bill
// @route   PUT /api/v1/bill/:id
// @access  Cashier (own mess)
const updateBill = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let balance;

  const { payment, isPaid } = req.body;
  if (!payment || (isPaid !== true && isPaid !== false)) {
    res.status(400);
    throw new Error("Provide required fields");
  }

  if (payment && isPaid === false) {
    res.status(400);
    throw new Error("Provide payment");
  }

  // check bill exists
  const billExists = await Bill.findOne({ _id, mess: req.user.mess });
  if (!billExists) {
    res.status(400);
    throw new Error("Bill does not exist");
  }

  // check user balance
  balance = await Balance.findOne({ user: billExists.user });
  if (!balance) {
    // update bill
    await Bill.updateOne({ _id }, { payment, isPaid });
    balance = await Balance.create({
      balance: payment - billExists.netAmount,
      user: billExists.user,
    });
  } else {
    // update bill
    await Bill.updateOne({ _id }, { payment, isPaid });
    balance = await Balance.updateOne(
      { user: billExists.user },
      {
        balance: balance.balance + (payment - billExists.netAmount),
      }
    );
  }

  res
    .status(200)
    .json({ success: true, balance, message: "Bill updated successfully" });
});

module.exports = { generateBills, getBills, updateBill, getBill };
