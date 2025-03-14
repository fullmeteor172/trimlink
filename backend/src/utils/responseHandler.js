/**
 * Response Handler
 * Standardizes API responses
 */

/**
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @returns {Object} - Express response
 */
const successResponse = (
  res,
  statusCode = 200,
  message = 'Success',
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};


/**
 * @param {Object} res - Express response object
 * @param {Error|Object} error - Error object or error details
 * @returns {Object} - Express response
 */
const errorResponse = (res, error) => {
  // Handle when an ApiError is passed
  if (error && error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Handle when separate parameters are passed
  const statusCode = typeof error === 'number' ? error : 500;
  const message = typeof error === 'string' ? error : 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
