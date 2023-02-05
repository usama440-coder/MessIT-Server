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

mealRouter.post("/", protect, permit("admin", "staff"), createMeal);
mealRouter.get("/", protect, getMeals);
mealRouter.get("/:id", protect, getMeal);
mealRouter.put("/:id", protect, permit("admin", "staff"), updateMeal);
mealRouter.delete("/:id", protect, permit("admin", "staff"), deleteMeal);

module.exports = mealRouter;
