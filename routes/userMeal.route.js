const express = require("express");
const userMealRouter = express.Router();
const { openMeal } = require("../controllers/userMeal.controller");

userMealRouter.post("/:id", openMeal);

module.exports = userMealRouter;
