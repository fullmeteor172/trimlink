const linkModel = require('../models/link.model');
const { ApiError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { SUPABASE_ANON_USER_UUID } = require('../config/environment');

/**
 * Shorten a URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

//TODO: Better request param validation
const createLink = async (req, res) => {
  try {
    const { originalUrl, maxUses, expiryDate } = req.body;

    if (!originalUrl) throw new ApiError(400, 'Original URL is required.');

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      throw new ApiError(400, 'Invalid URL format.');
    }

    // Determine user ID (null for anonymous users)
    const userId = req.user ? req.user.id : SUPABASE_ANON_USER_UUID;

    // Prepare options
    const options = {
      userId,
      maxUses,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    };

    const link = await linkModel.createLink(originalUrl, options);
    logger.info(`Created new shortened link: ${link.short_code}`);

    successResponse(res, 201, 'Shortened URL created successfully.', link);
  } catch (error) {
    logger.error('Error in createLink controller:', error);
    throw error;
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

    const link = await linkModel.getLinkByShortCode(shortCode);
    if (!link)
      return errorResponse(res, new ApiError(404, 'Short URL not found.'));

    // If max_uses has been exhausted, remove the link
    if (link.max_uses && link.visit_count >= link.max_uses) {
      await linkModel.expireLink(shortCode);
      return errorResponse(res, new ApiError(410, 'Short URL has expired.'));
    }

    // Check expiration
    if (new Date(link.expiry_date) < new Date()) {
      await linkModel.expireLink(shortCode);
      return errorResponse(res, new ApiError(410, 'Short URL has expired.'));
    }

    const incrementResult = await linkModel.incrementLinkVisitCount(shortCode);
    if (!incrementResult) {
      throw new ApiError(500, 'Failed to increment visit count.');
    }

    logger.info(`Redirecting ${shortCode} to ${link.original_url}`);
    res.redirect(303, link.original_url);
  } catch (error) {
    if (error instanceof ApiError) {
      logger.warn('API Error in redirectLink controller:', error);
      return errorResponse(res, error);
    } else {
      logger.error('Unexpected Error in redirectLink controller:', error);
      return errorResponse(res, new ApiError(500, 'Internal Server Error'));
    }
  }
};

/**
 * Get link by short code
 * @param {Object} req
 * @param {Object} res
 */
const getLinkByShortCode = async (req, res) => {
  try {
    const { shortCode } = req.params; // Using 'id' from route params as the short code

    const link = await linkModel.getLinkByShortCode(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    successResponse(res, 200, 'Link retrieved successfully.', link);
  } catch (error) {
    logger.error('Error in getLinkByShortCode controller:', error);
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

    const link = await linkModel.getLinkByShortCode(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(403, 'Unauthorized: You cannot delete this link.');
    }

    await linkModel.expireLink(link.short_code);
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

    const link = await linkModel.getLinkByShortCode(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(403, 'Unauthorized: You cannot update this link.');
    }

    await linkModel.updateOriginalLink(link.short_code, newUrl);
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

    const link = await linkModel.getLinkByShortCode(shortCode);
    if (!link) throw new ApiError(404, 'Short URL not found.');

    if (!req.user || req.user.id !== link.user_id) {
      throw new ApiError(
        403,
        "Unauthorized: You cannot access this link's stats."
      );
    }

    successResponse(res, 200, 'Link statistics retrieved successfully.', {
      visits: link.visit_count,
      maxUses: link.max_uses,
      isExpired: link.is_expired,
    });
  } catch (error) {
    logger.error('Error in getStats controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Get all links for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await linkModel.getAllLinksByUser(userId);
    successResponse(res, 200, 'Links retrieved successfully.', links);
  } catch (error) {
    logger.error('Error in getAllLinks controller:', error);
    errorResponse(res, error);
  }
};

/**
 * Get a specific link by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

// Make sure these are explicitly assigned to module.exports
module.exports = {
  createLink,
  redirectLink,
  deleteLink,
  updateLink,
  getStats,
  getAllLinks,
};
