const { createLogger, format, transports } = require("winston");

const logConfigurations = {
  transports: [
    new transports.File({
      filename: "../logs/server.log",
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.align(),
        format.colorize(),
        format.printf(
          (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
        )
      ),
    }),
  ],
};

const logger = createLogger(logConfigurations);

module.exports = logger;
