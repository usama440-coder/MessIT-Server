const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 5000;
  res.status(statusCode);

  if (process.env.environment === "DEV") {
    console.log(err);
  }
  res.json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
