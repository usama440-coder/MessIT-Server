const express = require("express");
const messRouter = express.Router();
const {
  createMess,
  getMess,
  deleteMess,
  updateMess,
} = require("../controllers/mess.controller");

messRouter.post("/mess", createMess);
messRouter.get("/mess", getMess);
messRouter.delete("/mess/:id", deleteMess);
messRouter.put("/mess/:id", updateMess);

module.exports = messRouter;
