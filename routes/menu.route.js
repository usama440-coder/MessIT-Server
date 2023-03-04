const express = require("express");
const menuRouter = express.Router();
const { protect, permit } = require("../middleware/auth.middleware");
const {
  createMenu,
  getMenu,
  updateMenu,
  deleteMenu,
} = require("../controllers/menu.controller");

menuRouter.post("/", protect, permit("secretary"), createMenu);
menuRouter.get(
  "/",
  protect,
  permit("user", "secretary", "staff", "cashier"),
  getMenu
);
menuRouter.put("/:id", protect, permit("secretary"), updateMenu);
menuRouter.delete("/:id", protect, permit("secretary"), deleteMenu);

module.exports = menuRouter;
