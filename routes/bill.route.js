const express = require("express");
const billRouter = express.Router();

billRouter.post("/", (req, res) => {
  res.send("bill");
});

module.exports = billRouter;
