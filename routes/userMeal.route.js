const express = require("express");
const userMealRouter = express.Router();
const { openMeal } = require("../controllers/userMeal.controller");
const { protect } = require("../middleware/auth.middleware");

userMealRouter.post("/:id", protect, openMeal);

module.exports = userMealRouter;
