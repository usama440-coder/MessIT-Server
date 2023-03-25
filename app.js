const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");
const connectDB = require("./database/db");
const userRouter = require("./routes/user.route");
const messRouter = require("./routes/mess.route");
const itemRouter = require("./routes/item.route");
const mealTypeRouter = require("./routes/mealType.route");
const mealRouter = require("./routes/meal.route");
const userMealRouter = require("./routes/userMeal.route");
const billRouter = require("./routes/bill.route");
const menuRouter = require("./routes/menu.route");
const balanceRouter = require("./routes/balance.route");
const statsRouter = require("./routes/stats.route");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary");
require("dotenv").config();

// middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/mess", messRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/mealType", mealTypeRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/userMeal", userMealRouter);
app.use("/api/v1/bill", billRouter);
app.use("/api/v1/menu", menuRouter);
app.use("/api/v1/balance", balanceRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/", (req, res) =>
  res.status(404).json({ success: false, message: "HELLO FROM SERVER" })
);
app.use("*", (req, res) =>
  res.status(404).json({ success: false, message: "404 PAGE NOT FOUND" })
);

// error middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT || 5000, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`);
});
