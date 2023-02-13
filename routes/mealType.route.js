const express = require("express");
const mealTypeRouter = express.Router();
const {
  addMealType,
  getMealTypes,
  deleteMealType,
  updateMealType,
} = require("../controllers/mealType.controller");
const { protect, permit } = require("../middleware/auth.middleware");

mealTypeRouter.post("/", protect, permit("secretary"), addMealType);
mealTypeRouter.get(
  "/",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getMealTypes
);
mealTypeRouter.delete("/:id", protect, permit("secretary"), deleteMealType);
mealTypeRouter.put("/:id", protect, permit("secretary"), updateMealType);

module.exports = mealTypeRouter;
