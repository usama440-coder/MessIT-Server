const express = require("express");
const statsRouter = express.Router();
const { protect, permit } = require("../middleware/auth.middleware");
const {
  getUserStats,
  getSecretaryStats,
  getCashierStats,
} = require("../controllers/stats.controller");

statsRouter.get("/user", protect, permit("user"), getUserStats);
statsRouter.get(
  "/secretary",
  protect,
  permit("secretary", "staff"),
  getSecretaryStats
);
statsRouter.get("/cashier", protect, permit("cashier"), getCashierStats);

module.exports = statsRouter;
