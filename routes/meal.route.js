const express = require("express");
const mealRouter = express.Router();
const { createMeal } = require("../controllers/meal.controller");

mealRouter.post("/", createMeal);

module.exports = mealRouter;
