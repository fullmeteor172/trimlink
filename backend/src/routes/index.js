/**
 * Routes index
 * Aggregates and exports all API routes
 */

const express = require('express');
const router = express.Router();
const linkRoutes = require('./link.routes'); // Fix the path if needed
const redirectRoutes = require('./redirect.routes'); // Fix the path if needed

// Routes with /api prefix
router.use('/api', linkRoutes);

// Redirect routes (at root level)
router.use('/', redirectRoutes);

module.exports = router;
