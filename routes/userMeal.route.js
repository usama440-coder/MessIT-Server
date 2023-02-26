const express = require("express");
const userMealRouter = express.Router();
const {
  openMeal,
  getUserMeal,
  updateUserMeal,
  getSingleUserMeal,
  getAllUserMeals,
} = require("../controllers/userMeal.controller");
const { protect, permit } = require("../middleware/auth.middleware");

userMealRouter.post(
  "/:id",
  protect,
  permit("user", "secretary", "cahier", "staff"),
  openMeal
);

userMealRouter.get(
  "/:id",
  protect,
  permit("user", "secretary", "cahier", "staff"),
  getUserMeal
);

userMealRouter.put("/:id", protect, permit("staff"), updateUserMeal);
userMealRouter.post(
  "/user/:id",
  protect,
  permit("staff", "user", "secretary", "cashier"),
  getSingleUserMeal
);

userMealRouter.get(
  "/",
  protect,
  permit("user", "staff", "secretary", "cashier"),
  getAllUserMeals
);

module.exports = userMealRouter;
