const express = require("express");
const balanceRouter = express.Router();
const { protect, permit } = require("../middleware/auth.middleware");
const { getBalance } = require("../controllers/balance.controller");

balanceRouter.get(
  "/:id",
  protect,
  permit("user", "seretary", "cashier", "staff"),
  getBalance
);

module.exports = balanceRouter;
