const asyncHandler = require("express-async-handler");
const Bill = require("../models/Bill.model");
const UserMeal = require("../models/UserMeal.model");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Generate bill all users
// @route   POST /api/v1/bill
// @access  Cashier (own mess), Admin
const generateBills = asyncHandler(async (req, res) => {
  const { from, to, unitCost, additionalCharges } = req.body;
  let billsData;

  // check required fields
  if (!checkRequiredFields(from, to, unitCost, additionalCharges)) {
    res.status(400);
    throw new Error("Please provide required fields");
  }

  // // cahier -- own mess
  if (req.user.role !== "cashier") {
    billsData = await UserMeal.aggregate([
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
          "mealData.validUntil": {
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
            $literal: req.user.id,
          },
        },
      },
    ]);
  } else {
    billsData = await UserMeal.aggregate([
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
              "mealData.validUntil": {
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
            $literal: req.user.id,
          },
        },
      },
    ]);
  }

  const bills = await Bill.insertMany(billsData);

  res.status(200).json({ success: true, bills });
});

module.exports = { generateBills };
