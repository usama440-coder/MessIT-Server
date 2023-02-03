const express = require("express");
const billRouter = express.Router();
const { generateBills } = require("../controllers/bill.controller");

billRouter.post("/", generateBills);

module.exports = billRouter;
