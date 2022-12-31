const asyncHandler = require("express-async-handler");

// @controller  general
// @message     Check if required fields are given
const checkRequiredFields = (...fields) => {
  for (let i = 0; i < fields.length; i++) {
    if (!fields[i]) {
      return false;
    }
  }

  return true;
};

// @controller  register a user
// @message     fields regex validation
const registerUserValidator = (name, email) => {
  if (
    name.length < 4 ||
    name.length > 100 ||
    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
  ) {
    return false;
  }

  return true;
};

module.exports = {
  registerUserValidator,
  checkRequiredFields,
};
