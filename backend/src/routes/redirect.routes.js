/**
 * Redirect Routes
 * Handles redirecting users from shortlinks to the original URLs
 */

const express = require('express');
const linkController = require('../controllers/link.controller');
const createRateLimiter = require('../middleware/rateLimiter.middleware');
const standardRateLimiter = createRateLimiter();

const router = express.Router();

router.get('/:shortCode', standardRateLimiter, linkController.redirectLink);

module.exports = router; // Make sure you're exporting the router
