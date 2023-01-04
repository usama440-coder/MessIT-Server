const express = require("express");
const mealTypeRouter = express.Router();
const {
  addMealType,
  getMealTypes,
  deleteMealType,
  updateMealType,
} = require("../controllers/mealType.controller");

mealTypeRouter.post("/", addMealType);
mealTypeRouter.get("/", getMealTypes);
mealTypeRouter.delete("/:id", deleteMealType);
mealTypeRouter.put("/:id", updateMealType);

module.exports = mealTypeRouter;
