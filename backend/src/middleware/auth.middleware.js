/**
 * Authentication Middleware
 * Verifies JWT tokens from Supabase and manages user authentication
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const logger = require('../utils/logger');
const { ApiError } = require('./error.middleware');

/**
 * Exctracts and verifies the JWT associated with the request
 * sets req.user if token is valid, otherwise sets req.user to null and moves on
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //Checking if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    //Extracting and verifying the token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role || 'authenticated',
    };

    //The token was verified, the req.user was updated, moving on to the next middleware
    return next();
  } catch (error) {
    logger.warn('Token verification failed for: ' + req.ip, error);
    req.user = null;
    return next();
  }
};

/**
 * Middleware to require authentication
 * To be used after verifyToken
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  return next();
};

module.exports = {
  verifyToken,
  requireAuth,
};
