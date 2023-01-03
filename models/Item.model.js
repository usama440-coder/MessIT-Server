const mongoose = require("mongoose");

const ItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name required"],
      unique: [true, "Item already exists"],
      minLength: [4, "Cannot be less than 4 characters"],
      maxLength: [40, "Cannot be greater then 40 characters"],
    },

    units: {
      type: Number,
      required: [true, "Item units required"],
      min: [0, "Invalid value"],
    },
    mess: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: [true, "Mess name required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", ItemSchema);
