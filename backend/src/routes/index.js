/**
 * Routes index
 * Aggregates and exports all API routes
 */

const express = require('express');
const router = express.Router();
const linkRoutes = require('./link.routes'); // Fix the path if needed
const redirectRoutes = require('./redirect.routes'); // Fix the path if needed

// Use the routers as middleware
router.use('/api', linkRoutes);
router.use('/', redirectRoutes);

module.exports = router;
