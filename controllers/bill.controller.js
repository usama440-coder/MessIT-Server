const asyncHandler = require("express-async-handler");
const { checkRequiredFields } = require("../utils/validator");

// @desc    Generate bill all users
// @route   POST /api/v1/id
// @access  Cashier, Admin
const generateBill = asyncHandler(async (req, res) => {});
