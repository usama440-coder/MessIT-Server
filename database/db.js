const mongoose = require("mongoose");

const connectDB = () => {
  try {
    mongoose.set("strictQuery", false);
    const connection = mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected`);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
