const express = require("express");
const messRouter = express.Router();
const {
  createMess,
  getMess,
  deleteMess,
  updateMess,
  getAMess,
} = require("../controllers/mess.controller");
const { protect, permit } = require("../middleware/auth.middleware");

messRouter.post("/", protect, permit("admin"), createMess);
messRouter.get("/", protect, permit("admin"), getMess);
messRouter.delete("/:id", protect, permit("admin"), deleteMess);
messRouter.put("/:id", protect, permit("admin"), updateMess);
messRouter.get("/:id", protect, getAMess);

module.exports = messRouter;
