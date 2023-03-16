const express = require("express");
const billRouter = express.Router();
const {
  generateBills,
  getBills,
  updateBill,
  getBill,
} = require("../controllers/bill.controller");
const { protect, permit } = require("../middleware/auth.middleware");

billRouter.post("/", protect, permit("cashier"), generateBills);
billRouter.get("/", protect, permit("cashier", "user"), getBills);
billRouter.put("/:id", protect, permit("cashier"), updateBill);
billRouter.get("/:id", protect, permit("cashier"), getBill);

module.exports = billRouter;
