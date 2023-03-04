const express = require("express");
const billRouter = express.Router();
const {
  generateBills,
  getBills,
  updateBill,
} = require("../controllers/bill.controller");
const { protect, permit } = require("../middleware/auth.middleware");

billRouter.post("/", protect, permit("cashier"), generateBills);
billRouter.get(
  "/",
  protect,
  permit("user", "cashier", "secretary", "staff"),
  getBills
);
billRouter.put("/:id", protect, permit("cashier"), updateBill);

module.exports = billRouter;
