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
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/mess", messRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/mealType", mealTypeRouter);
app.use("/api/v1/meal", mealRouter);
app.use("/api/v1/userMeal", userMealRouter);
app.use("/api/v1/bill", billRouter);
app.use("/api/v1/menu", menuRouter);

// error middleware
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT || 5000, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`);
});
