const express = require("express");
const userMealRouter = express.Router();
const { openMeal } = require("../controllers/userMeal.controller");
const { protect, permit } = require("../middleware/auth.middleware");

userMealRouter.post(
  "/:id",
  protect,
  permit("user", "secretary", "cahier", "staff"),
  openMeal
);

module.exports = userMealRouter;
