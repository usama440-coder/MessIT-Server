const asyncHandler = require("express-async-handler");
const Balance = require("../models/Balance.model");

// @desc    Get a user balance
// @route   GET /api/v1/balance/:id
// @access  Cashier (all users), User (own balance)
const getBalance = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  let balance;

  // get balance
  if (req.user.role.includes("cashier")) {
    balance = await Balance.findOne({ user: _id });
  } else {
    balance = await Balance.findOne({ user: req.user.id });
  }

  if (!balance) {
    res.status(200).json({ success: true, balance: { balance: 0 } });
  } else {
    res.status(200).json({ success: true, balance });
  }
});

module.exports = { getBalance };
