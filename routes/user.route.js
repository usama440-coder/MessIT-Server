const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
} = require("../controllers/user.controller");

userRouter.post("/users", registerUser);
userRouter.get("/users", getUsers);
userRouter.get("/users/:id", getUser);
userRouter.delete("/users/:id", deleteUser);
userRouter.put("/users/:id", updateUser);

module.exports = userRouter;
