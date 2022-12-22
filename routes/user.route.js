const express = require("express");
const userRouter = express.Router();
const { registerUser } = require("../controllers/user.controller");

userRouter.post("/users", registerUser);

module.exports = userRouter;
