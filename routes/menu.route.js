const express = require("express");
const menuRouter = express.Router();
const { protect, permit } = require("../middleware/auth.middleware");
const { createMenu } = require("../controllers/menu.controller");

menuRouter.post("/", protect, permit("secretary"), createMenu);

module.exports = menuRouter;
