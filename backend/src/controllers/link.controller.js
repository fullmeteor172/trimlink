const linkModel = require('../models/link.model');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

/**
 * Shorten a URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLink = async (req, res) => {
  try {
    const { originalUrl, maxUses, expiryDate, deleteOnRead } = req.body;

    if (!originalUrl) throw new ApiError(400, 'Original URL is required.');

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      throw new ApiError(400, 'Invalid URL format.');
    }

    // Determine user ID (null for anonymous users)
    const userId = req.user ? req.user.id : null;

    // Prepare options
    const options = {
      userId,
      maxUses,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      deleteOnRead,
    };

    const link = await linkModel.createLink(originalUrl, options);
    logger.info(`Created new shortened link: ${link.short_code}`);

    successResponse(res, 201, 'Shortened URL created successfully.', link);
  } catch (error) {
    logger.error('Error in createLink controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Get original URL from short code and redirect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await linkModel.getLinkObject(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    // Check expiration
    if (new Date(link.expiry_date) < new Date()) {
      await linkModel.deleteLink(shortCode);
      throw new ApiError(410, 'Short URL has expired.');
    }

    // If delete_on_read is enabled, remove the link after first visit
    if (link.delete_on_read) {
      await linkModel.deleteLink(shortCode);
    } else {
      await linkModel.incrementLinkVisitCount(shortCode);
    }

    logger.info(`Redirecting ${shortCode} to ${link.original_url}`);
    res.redirect(link.original_url);
  } catch (error) {
    logger.error('Error in redirectLink controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Delete a shortened URL (Only the creator can delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await linkModel.getLinkObject(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(403, 'Unauthorized: You cannot delete this link.');
    }

    await linkModel.deleteLink(shortCode);
    successResponse(res, 200, 'Short URL deleted successfully.');
  } catch (error) {
    logger.error('Error in deleteLink controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Update the original URL of a short link (Only the creator can update)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { newUrl } = req.body;

    if (!newUrl) throw new ApiError(400, 'New URL is required.');

    // Validate new URL
    try {
      new URL(newUrl);
    } catch (error) {
      throw new ApiError(400, 'Invalid URL format.');
    }

    const link = await linkModel.getLinkObject(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(403, 'Unauthorized: You cannot update this link.');
    }

    await linkModel.updateOriginalLink(shortCode, newUrl);
    successResponse(res, 200, 'Short URL updated successfully.');
  } catch (error) {
    logger.error('Error in updateLink controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Get visit statistics for a short link (Only for registered users)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await linkModel.getLinkObject(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(
        403,
        "Unauthorized: You cannot access this link's stats."
      );
    }

    successResponse(res, 200, 'Link statistics retrieved successfully.', {
      visits: link.visit_count,
    });
  } catch (error) {
    logger.error('Error in getStats controller:', error);
    errorResponse(res, error);
  }
};

module.exports = {
  createLink,
  redirectLink,
  deleteLink,
  updateLink,
  getStats,
};
