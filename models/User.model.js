const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide user name"],
      minLength: 4,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
      enum: {
        values: ["admin", "user", "secretary", "cashier", "staff"],
        message: "Value is not supported",
      },
    },
    profile: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
