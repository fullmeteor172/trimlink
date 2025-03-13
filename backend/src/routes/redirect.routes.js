/**
 * Redirect Routes
 * Handles redirecting users from shortlinks to the original URLs
 */

const express = require('express');
const linkModel = require('../models/link.model');
const logger = require('../utils/logger');

const router = express.Router();
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    logger.debug(`Received request for short code: ${shortCode}`);

    // Retrieve link object from the database
    const linkObj = await linkModel.getLinkObject(shortCode);
    logger.debug(`Link object retrieved: ${JSON.stringify(linkObj)}`);

    // Link not found check
    if (!linkObj) {
      logger.info(`Link not found: ${shortCode}`);
      return res.status(404).render('not-found', { shortCode });
    }

    // Link expiration check
    if (linkObj.expiry_date && new Date() > new Date(linkObj.expiry_date)) {
      logger.info(`Expired link: ${shortCode}`);
      return res.status(410).render('expired', { shortCode });
    }

    // Handle links whose max_uses are exhausted
    if (linkObj.max_uses !== null && linkObj.visit_count >= linkObj.max_uses) {
      setTimeout(async () => {
        await linkModel.expireLink(shortCode);
        logger.info(`Max uses exhausted: ${shortCode}`);
      }, 100);
    }

    // Incrementing visit_count for the link
    await linkModel.incrementLinkVisitCount(shortCode);

    // Ensure URL has a protocol
    let redirectUrl = linkObj.original_url;
    if (
      !redirectUrl.startsWith('http://') &&
      !redirectUrl.startsWith('https://')
    ) {
      redirectUrl = 'https://' + redirectUrl;
    }

    logger.info(`Redirecting ${shortCode} -> ${redirectUrl}`);

    // Redirect to the original URL
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error(`Error processing short code ${req.params.shortCode}:`, error);
    next(error);
  }
});

module.exports = router; // Make sure you're exporting the router
