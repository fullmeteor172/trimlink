/**
 * Error handling middleware
 * Provides centralized error handling for the API
 */

const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    //Constructor call and the middleware is ignored in the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  //Default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const logDetails = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    statusCode,
    message,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error('Server Error:', logDetails);
  } else {
    logger.warn('Client Error: ', logDetails);
  }

  res.status(statusCode).json({
    success: false,
    message,
    //Stack trace only in develelopment environment
    ...(config.NODE_ENV == 'devlopment' && { stack: err.stack }),
  });
};

module.exports = {
  ApiError,
  errorHandler,
};
