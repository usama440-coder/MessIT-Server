const express = require("express");
const userRouter = express.Router();
const {
  registerUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  loginUser,
  resetPasswordRequest,
  resetPassword,
  aboutSection,
} = require("../controllers/user.controller");
const { protect, permit } = require("../middleware/auth.middleware");
const singleUpload = require("../middleware/multer.middleware");

userRouter.post("/", protect, permit("admin"), singleUpload, registerUser);
userRouter.get("/about", protect, aboutSection);
userRouter.post("/login", loginUser);
userRouter.get(
  "/",
  protect,
  permit("admin", "secretary", "cashier", "staff"),
  getUsers
);
userRouter.get("/:id", protect, getUser);
userRouter.delete("/:id", protect, permit("admin"), deleteUser);
userRouter.put("/:id", protect, permit("admin"), singleUpload, updateUser);
userRouter.post("/reset-password-link", resetPasswordRequest);
userRouter.post("/reset-password", resetPassword);

module.exports = userRouter;
