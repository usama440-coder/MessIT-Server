const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode ? res.statusCode : 500;
  let message = err.message;

  // mongoose cast objectId error
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  // mongoose duplicate key error
  if (err.code === 11000) {
    message = "Duplicate key error";
    statusCode = 400;
  }

  // mongoose validation error
  if (err.name === "ValidationError") {
    message = "Validation error";
    statusCode = 400;
  }

  if (process.env.environment === "DEV") {
    console.log(err);
  }
  res.status(statusCode).json({
    success: false,
    message: message || "Internal server error",
  });
};

module.exports = errorHandler;
