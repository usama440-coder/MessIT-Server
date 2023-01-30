const express = require("express");
const mealRouter = express.Router();
const {
  createMeal,
  getMeals,
  updateMeal,
  getMeal,
  deleteMeal,
} = require("../controllers/meal.controller");

mealRouter.post("/", createMeal);
mealRouter.get("/", getMeals);
mealRouter.get("/:id", getMeal);
mealRouter.put("/:id", updateMeal);
mealRouter.delete("/:id", deleteMeal);

module.exports = mealRouter;
