/**
 * Rate Limiter
 * Prevents abuse of API by limiting request frequency
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 *
 * @param {Object} options
 * @param {number} [options.windowMS] - Max window size of rate limiting in ms
 * @param {number} [options.max] - Max frequency of allowed requests within the window
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMS: options.windowMS || config.RATE_LIMIT_WINDOW_MS,
    max: options.max || config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: true,
    skipSuccessfulRequests: false,
    message: {
      success: false,
      message: options.message || 'Too many requests, please try again later',
    },
    handler: (req, res, next, options) => {
      // Log rate limit exceeded
      logger.info(
        `Rate limit exceeded: ${
          req.user?.id ? `User: ${req.user.id}` : ''
        } IP: ${req.ip}, URL: ${req.originalUrl}, Method: ${req.method}`
      );

      // Send server response
      res.status(429).json(options.message);
    },

    keyGenerator: (req) => {
      // If user ID is provided for authenticated requests
      if (req.user?.id) {
        return `user_${req.user.id}`;
      }

      // Fallback IP address
      return req.ip;
    },

    skip: (req) => {
      if (req.path === '/health') {
        return true;
      }

      return false;
    },
  });
};

module.exports = createRateLimiter;
