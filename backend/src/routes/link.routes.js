/**
 * Link Routes
 * API endpoints for creating and managing shortened links
 */

const express = require('express');
const linkController = require('../controllers/link.controller');
const { verifyToken, requireAuth } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// Debug each middleware
console.log('rateLimiter type:', typeof rateLimiter);
console.log('verifyToken type:', typeof verifyToken);
console.log('requireAuth type:', typeof requireAuth);

// Create a new shortened link - simplify to identify the problem
router.post('/links', 
  typeof rateLimiter === 'function' ? rateLimiter : (req, res, next) => next(),
  typeof verifyToken === 'function' ? verifyToken : (req, res, next) => next(),
  typeof linkController.createLink === 'function' ? linkController.createLink : (req, res) => res.status(500).json({ error: 'Controller not available' })
);

// All other routes with simplified middleware checks
router.get('/links',
  typeof verifyToken === 'function' ? verifyToken : (req, res, next) => next(),
  typeof requireAuth === 'function' ? requireAuth : (req, res, next) => next(),
  typeof linkController.getAllLinks === 'function' ? linkController.getAllLinks : (req, res) => res.status(500).json({ error: 'Controller not available' })
);

router.get('/links/:id',
  typeof verifyToken === 'function' ? verifyToken : (req, res, next) => next(),
  typeof requireAuth === 'function' ? requireAuth : (req, res, next) => next(),
  typeof linkController.getLinkById === 'function' ? linkController.getLinkById : (req, res) => res.status(500).json({ error: 'Controller not available' })
);

router.put('/links/:id',
  typeof verifyToken === 'function' ? verifyToken : (req, res, next) => next(),
  typeof requireAuth === 'function' ? requireAuth : (req, res, next) => next(),
  typeof linkController.updateLink === 'function' ? linkController.updateLink : (req, res) => res.status(500).json({ error: 'Controller not available' })
);

router.delete('/links/:id',
  typeof verifyToken === 'function' ? verifyToken : (req, res, next) => next(),
  typeof requireAuth === 'function' ? requireAuth : (req, res, next) => next(),
  typeof linkController.deleteLink === 'function' ? linkController.deleteLink : (req, res) => res.status(500).json({ error: 'Controller not available' })
);

// Special fallback route for debugging
router.post('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

module.exports = router;