const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 5000;
  res.status(statusCode);

  res.json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;
