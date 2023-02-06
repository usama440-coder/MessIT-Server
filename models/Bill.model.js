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
    totalUnits: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
      required: true,
    },
    additionalCharges: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: Number,
      default: 0,
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
