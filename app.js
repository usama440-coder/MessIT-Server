const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./database/db");
const userRouter = require("./routes/user.route");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1", userRouter);

const PORT = process.env.PORT;
app.listen(PORT || 5000, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`);
});
