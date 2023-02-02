const mongoose = require("mongoose");

const BillSchema = mongoose.Schema(
  {
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
      required: true,
    },
    units: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    additionalAmount: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", BillSchema);
