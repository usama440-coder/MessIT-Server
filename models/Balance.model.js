const mongoose = require("mongoose");

const BalanceSchema = mongoose.Schema({
  balance: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Balance", BalanceSchema);
