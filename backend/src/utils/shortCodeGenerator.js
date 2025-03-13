/**
 * Short Code Generator
 * Utility to make short codes for links
 */

const crypto = require('crypto');

/**
 * Generate a random alphanumberic code of a specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Generated String
 */

const generateShortCode = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtsuvwxyz0123456789"

  //Creates a binary buffer of the required length [0-255] * some length (in base 10)
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for(let i = 0; i<length; i++){
    result += chars[randomBytes[i] % chars.length];
  }

  return result;
}

module.exports = generateShortCode;