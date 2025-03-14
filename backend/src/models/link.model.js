/**
 * Link Model
 * Handles CRUD operations for trimlink
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('../config/environment');
const logger = require('../utils/logger');
const generateShortCode = require('../utils/shortCodeGenerator');

//Supabase client instance with RLS bypass
const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_SECRET
);

/**
 * Create a new short link using original url and several additional options
 * @param {string} originalUrl - The original URL to shorten
 * @param {Object} options - Additional options for the link
 * @param {String} [options.userId] - User ID for the link
 * @param {Date} [options.expiryDate] - Expiration date for the link
 * @param {number} [options.maxUses] - Maximum times the link can be used
 * @returns {Object} The created link object
 */
const createLink = async (originalUrl, options = {}) => {
  try {
    const {
      userId = config.SUPABASE_ANON_USER_UUID,
      expiryDate,
      maxUses = null,
    } = options;
    let shortCode = generateShortCode(config.SHORT_CODE_LENGTH);
    let isUnique = false;

    //Checking if the shortcode exists in supabase, regenerates shortcode if it does
    while (!isUnique) {
      const { data } = await supabase
        .from('links')
        .select('short_code')
        .eq(shortCode);
      isUnique = !data;

      if (!isUnique) shortCode = generateShortCode(config.SHORT_CODE_LENGTH);
    }

    // Add protocol if missing
    let formattedUrl = originalUrl;
    if (
      !formattedUrl.startsWith('http://') &&
      !formattedUrl.startsWith('https://')
    ) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const createdDate = new Date();

    //Setting expiry date if none is provided for anon users
    let finalExpiryDate = expiryDate;

    if (!options.expiryDate) {
      let now = new Date();
      finalExpiryDate = new Date(
        now.setDate(now.getDate() + config.ANON_LINK_EXPIRY_DAYS)
      );
    }

    //Inserting new shortlink into the DB and returning that row as a single object.
    const { data, error } = await supabase
      .from('links')
      .insert({
        user_id: userId,
        short_code: shortCode,
        original_url: formattedUrl,
        created_date: createdDate,
        expiry_date: finalExpiryDate,
        max_uses: maxUses,
        visit_count: 0,
        is_expired: false,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create link', error);
      throw error;
    }

    return {
      ...data,
      shortURL: `${config.BASE_URL}:${config.PORT}/${shortCode}`,
    };
  } catch (error) {
    logger.error('Error in createLink', error);
  }
};

/**
 * Get link object using short code
 * @param {string} shortCode - Short code for the link
 * @returns {Object} The row entry for the link that corresponds to the provided short code
 */
const getLinkByShortCode = async (shortCode) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (error) {
      //No matching row is found
      if (error.code == 'PGST116') {
        logger.info('No shortLink associated with this URL', error);
      }

      logger.error('Failed to get original link.', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in getLinkByShortCode', error);
    throw error;
  }
};

/**
 * Increment link using short code
 * @param {string} shortCode - Short code for the link
 * @returns {boolean}
 */
const incrementLinkVisitCount = async (shortCode) => {
  try {
    const { data, error } = await supabase.rpc('increment_visit_count', {
      p_short_code: shortCode, // Pass the parameter as an object with the correct key
    });
    if (error) {
      logger.error('Error incrementing visit count:', error);
      throw error;
    } else {
      return true;
    }
  } catch (error) {
    logger.error('Error in incrementLinkVisitCount', error);
    throw error;
  }
};

/**
 * Delete link using short code
 * @param {string} short_code
 * @returns {boolean}
 */
const deleteLink = async (shortCode) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .delete()
      .eq('short_code', shortCode);

    if (error) {
      logger.error('Error deleting link', error);
      throw error;
    }
    return true;
  } catch (error) {
    logger.error('Error in deleteLink', error);
    throw error;
  }
};

/**
 *
 * @param {string} shortCode - Short code of the link to be updated
 * @param {string} newUrl - Replacement URL
 * @returns {boolean}
 */
const updateOriginalLink = async (shortCode, newUrl) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .update({ original_url: newUrl })
      .eq('short_code', shortCode);

    if (error) {
      logger.error('Error in updating link.', error);
      throw error;
    }

    return true;
  } catch (error) {
    logger.error('Error in updateOriginalLink model', error);
    throw error;
  }
};

/**
 *
 * @param {string} shortCode - Short code of the link to be expired
 * @returns {boolean}
 */
const expireLink = async (shortCode) => {
  try {
    const { date, error } = await supabase
      .from('links')
      .update({
        is_expired: true,
      })
      .eq('short_code', shortCode);

    if (error) {
      logger.error('Error in expiring link', error);
      throw error;
    }

    return true;
  } catch (error) {
    logger.error('Error in expireLink model', error);
    throw error;
  }
};

/**
 * Get all links for a specific user
 * @param {string} userId - User ID
 * @returns {Array} List of links
 */
const getAllLinksByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      logger.error('Error in getAllLinksByUser', error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in getAllLinksByUser model', error);
    throw error;
  }
};

module.exports = {
  createLink,
  getLinkByShortCode,
  updateOriginalLink,
  incrementLinkVisitCount,
  deleteLink,
  expireLink,
  getAllLinksByUser,
};
