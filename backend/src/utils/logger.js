/**
 * Logger Utility
 * Provides consistent logging throughout the application
 * Written using AI because holy shit is this boring work ✨
 */

const winston = require('winston');
const {format, transports} = winston;

// Define log formats
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Console format for development
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...rest }) => {
    const restString = Object.keys(rest).length ? 
      `\n${JSON.stringify(rest, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${message}${restString}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'trimlink-api' },
  transports: [
    // Console transport for all environments
    new transports.Console({
      format: consoleFormat
    }),
    // File transport for non-development environments
    ...(process.env.NODE_ENV !== 'development' ? [
      // Write all logs with level 'error' and below to error.log
      new transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      // Write all logs to combined.log
      new transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    ] : [])
  ]
});

module.exports = logger;