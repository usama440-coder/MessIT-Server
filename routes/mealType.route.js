const express = require("express");
const mealTypeRouter = express.Router();
const {
  addMealType,
  getMealTypes,
  deleteMealType,
  updateMealType,
} = require("../controllers/mealType.controller");
const { protect, permit } = require("../middleware/auth.middleware");

mealTypeRouter.post(
  "/",
  protect,
  permit("admin", "secretary", "staff"),
  addMealType
);
mealTypeRouter.get("/", protect, getMealTypes);
mealTypeRouter.delete(
  "/:id",
  protect,
  permit("admin", "secretary", "staff"),
  deleteMealType
);
mealTypeRouter.put(
  "/:id",
  protect,
  permit("admin", "secretary", "staff"),
  updateMealType
);

module.exports = mealTypeRouter;
