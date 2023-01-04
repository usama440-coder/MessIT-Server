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

// @controller  add an item
// @message     fields regex validation
const addItemValidator = (name, units) => {
  if (name?.length < 4 || name?.length > 40 || units < 0) {
    return false;
  }

  return true;
};

// @controller  add an meal type
// @message     fields regex validation
const addMealTypeValidator = (type) => {
  if (type?.length < 3 || type?.length > 50) {
    return false;
  }

  return true;
};

module.exports = {
  registerUserValidator,
  checkRequiredFields,
  addItemValidator,
  addMealTypeValidator,
};
