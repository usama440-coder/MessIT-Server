const express = require("express");
const mealRouter = express.Router();
const {
  createMeal,
  getCurrentMeals,
  getPreviousMeals,
  updateMeal,
  getMeal,
  deleteMeal,
} = require("../controllers/meal.controller");
const { protect, permit } = require("../middleware/auth.middleware");

mealRouter.post("/", protect, permit("staff"), createMeal);
mealRouter.get(
  "/current",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getCurrentMeals
);
mealRouter.get(
  "/previous",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getPreviousMeals
);
mealRouter.get(
  "/:id",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getMeal
);
mealRouter.put("/:id", protect, permit("staff"), updateMeal);
mealRouter.delete("/:id", protect, permit("staff"), deleteMeal);

module.exports = mealRouter;
