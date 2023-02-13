const express = require("express");
const mealRouter = express.Router();
const {
  createMeal,
  getMeals,
  updateMeal,
  getMeal,
  deleteMeal,
} = require("../controllers/meal.controller");
const { protect, permit } = require("../middleware/auth.middleware");

mealRouter.post("/", protect, permit("staff"), createMeal);
mealRouter.get(
  "/",
  permit("user", "sercretary", "staff", "cashier"),
  protect,
  getMeals
);
mealRouter.get(
  "/:id",
  protect,
  permit("user", "sercretary", "staff", "cashier"),
  getMeal
);
mealRouter.put("/:id", protect, permit("staff"), updateMeal);
mealRouter.delete("/:id", protect, permit("staff"), deleteMeal);

module.exports = mealRouter;
