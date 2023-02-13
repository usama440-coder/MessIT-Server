const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  loginUser,
} = require("../controllers/user.controller");
const { protect, permit } = require("../middleware/auth.middleware");

userRouter.post("/", registerUser);
userRouter.post("/login", loginUser);
userRouter.get(
  "/",
  protect,
  permit("admin", "secretary", "cashier", "staff"),
  getUsers
);
userRouter.get("/:id", protect, getUser);
userRouter.delete("/:id", protect, permit("admin"), deleteUser);
userRouter.put("/:id", protect, permit("admin"), updateUser);

module.exports = userRouter;
