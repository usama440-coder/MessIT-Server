const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 5000;

  if (process.env.environment === "DEV") {
    console.log(err);
    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = errorHandler;
