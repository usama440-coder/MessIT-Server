const express = require("express");
const userRouter = express.Router();
const { registerUser, getUsers } = require("../controllers/user.controller");

userRouter.post("/users", registerUser);
userRouter.get("/users", getUsers);

module.exports = userRouter;
