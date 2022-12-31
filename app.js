const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");
const connectDB = require("./database/db");
const userRouter = require("./routes/user.route");
const messRouter = require("./routes/mess.route");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1", userRouter);
app.use("/api/v1", messRouter);

// error middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT || 5000, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`);
});
