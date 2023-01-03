const express = require("express");
const itemRouter = express.Router();
const {
  addItem,
  getItems,
  getItem,
  deleteItem,
  updateItem,
} = require("../controllers/item.controller");

itemRouter.post("/", addItem);
itemRouter.get("/", getItems);
itemRouter.get("/:id", getItem);
itemRouter.delete("/:id", deleteItem);
itemRouter.put("/:id", updateItem);

module.exports = itemRouter;
