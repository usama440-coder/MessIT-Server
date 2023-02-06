const express = require("express");
const billRouter = express.Router();
const { generateBills } = require("../controllers/bill.controller");
const { protect, permit } = require("../middleware/auth.middleware");

billRouter.post("/", protect, permit("admin", "cashier"), generateBills);

module.exports = billRouter;
