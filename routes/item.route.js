const express = require("express");
const itemRouter = express.Router();
const {
  addItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
} = require("../controllers/item.controller");
const { protect, permit } = require("../middleware/auth.middleware");

itemRouter.post("/", protect, permit("secretary"), addItem);
itemRouter.get(
  "/",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getItems
);
itemRouter.get(
  "/:id",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getItem
);
itemRouter.delete("/:id", protect, permit("secretary"), deleteItem);
itemRouter.put("/:id", protect, permit("secretary"), updateItem);

module.exports = itemRouter;
