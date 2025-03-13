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
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Additional error details (Error object)
 */
const errorResponse = (
  res,
  statusCode = 500,
  message = 'Error',
  errors = null
) => {
  return res.status(statusCode).json({
    message: message,
    ...(errors && { errors }),
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
