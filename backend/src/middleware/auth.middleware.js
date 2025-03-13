/**
 * Authentication Middleware
 * Verifies JWT tokens from Supabase and manages user authentication
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const logger = require('../utils/logger');
//TODO: Adding in a response handler

/**
 * Middleware to verify JWT
 * Sets req.user if token is valid, else sets it to null
 */

const verifyToken = (req, res, next) => {
  try {
    //Getting the token from request header
    const authHeader = req.headers.authorization;

    //TODO: More robust auth header validation
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      next();
    }
    //Verify token, if this fails and error is thrown
    const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.error(`Auth Error: ${error.message}`);
    //Token is invalid but we continue as anonymous
    req.user = null;
    next();
  }
};

module.exports = verifyToken;
