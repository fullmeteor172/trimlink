/**
 * Rate Limiter
 * Prevents abooose of API by limiting request frequency
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: true,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many requests, slow down broski.',
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded for ${
        req.user && req.user.id ? 'USER:' + req.user.id + ' ,' : ''
      }IP: ${req.ip}, URL: ${req.originalUrl}, Method: ${req.method}`
    );
    res.status(429).json(options.message);
  },
  keyGenerator: (req) => {
    //If the request has an ID we use that to rate limit.
    //TODO: Implementing user id validity checking, variable rate limits
    if (req.user?.id) return `user_${req.user.id}`;
    return req.ip;
  },
  skip: (req) => {
    //TODO: Logic for skipping rate limiting for some clients
    return false;
  },
});

module.exports = rateLimiter;
