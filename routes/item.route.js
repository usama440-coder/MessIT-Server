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

itemRouter.post("/", protect, permit("admin", "secretary"), addItem);
itemRouter.get("/", protect, getItems);
itemRouter.get("/:id", protect, getItem);
itemRouter.delete("/:id", protect, permit("admin", "secretary"), deleteItem);
itemRouter.put("/:id", protect, permit("admin", "secretary"), updateItem);

module.exports = itemRouter;
