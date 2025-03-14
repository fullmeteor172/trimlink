/**
 * Link Routes
 * API endpoints for creating and managing shortened links
 */

const express = require('express');
const linkController = require('../controllers/link.controller');
const { verifyToken, requireAuth } = require('../middleware/auth.middleware');
const createRateLimiter = require('../middleware/rateLimiter.middleware');

const router = express.Router();

const createLinkRateLimiter = createRateLimiter({
  windowMS: 60 * 1000,
  max: 5,
  message: 'Too many link creation requets, try again later',
});

const standardRateLimiter = createRateLimiter();

//Create new shortened link
router.post(
  '/links',
  createLinkRateLimiter,
  verifyToken,
  //No requireAuth middleware to make it open for anonymous users too
  linkController.createLink
);

//Get all links of a user
router.get(
  '/links',
  standardRateLimiter,
  verifyToken,
  requireAuth,
  linkController.getAllLinks
);

//Update original link for an existing short link for a user
router.put(
  '/links/:shortCode',
  standardRateLimiter,
  verifyToken,
  requireAuth,
  linkController.updateLink
);

//Delete (expire) a link for a user
router.delete(
  '/links/:shortCode',
  standardRateLimiter,
  verifyToken,
  requireAuth,
  linkController.deleteLink
);

//Get statistics for a specific link
router.get(
  '/links/:shortCode/stats',
  standardRateLimiter,
  verifyToken,
  requireAuth,
  linkController.getStats
);

module.exports = router;
