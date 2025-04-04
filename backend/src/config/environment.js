/**
 * Environment configuration
 * Loads and validates environment variables
 */

require('dotenv').config();

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_PUBLIC_API_KEY',
  'SUPABASE_JWT_SECRET',
  'SUPABASE_ANON_USER_UUID',
];

//Checking for missing environment variable
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variabels: ${missingEnvVars.join(', ')}`
  );
}

module.exports = {
  // Server config
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Supabase config
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_PUBLIC_API_KEY: process.env.SUPABASE_PUBLIC_API_KEY,
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
  SUPABASE_SERVICE_ROLE_SECRET: process.env.SUPABASE_SERVICE_ROLE_SECRET,
  SUPABASE_ANON_USER_UUID: process.env.SUPABASE_ANON_USER_UUID,

  // Link config
  BASE_URL:
    process.env.BASE_URL || 'http://localhost',
  ANON_LINK_EXPIRY_DAYS: parseInt(
    process.env.ANON_LINK_EXPIRY_DAYS || '30',
    10
  ),
  SHORT_CODE_LENGTH: parseInt(process.env.SHORT_CODE_LENGTH || '6', 10),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '60000',
    10
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '15',
    10
  ),
};
