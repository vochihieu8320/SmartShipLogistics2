/**
 * Application Configuration
 * 
 * This file centralizes all configuration settings loaded from environment variables.
 * No hard-coded database credentials or sensitive information should be stored here.
 */

// Database Configuration
export const dbConfig = {
  // Connection string for PostgreSQL database (required)
  connectionString: process.env.DATABASE_URL,
  
  // Optional database configuration params
  ssl: process.env.DB_SSL === 'true',
  maxConnections: process.env.DB_MAX_CONNECTIONS ? 
    parseInt(process.env.DB_MAX_CONNECTIONS) : 20,
  idleTimeoutMs: process.env.DB_IDLE_TIMEOUT ?
    parseInt(process.env.DB_IDLE_TIMEOUT) : 30000
};

// Session Configuration
export const sessionConfig = {
  // Secret key for signing session cookies (required in production)
  secret: process.env.SESSION_SECRET || 'dev-key-not-for-production',
  
  // Session table name in database
  tableName: process.env.SESSION_TABLE_NAME || 'session',
  
  // Session cookie max age in milliseconds (default: 24 hours)
  maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'),
  
  // Secure cookies should be used in production
  secureCookies: process.env.NODE_ENV === 'production',
  
  // Use secure cookies even in development if specified
  forceSecureCookies: process.env.FORCE_SECURE_COOKIES === 'true'
};

// Server Configuration
export const serverConfig = {
  // Port to listen on
  port: parseInt(process.env.PORT || '5000'),
  
  // Environment (development, production, test)
  environment: process.env.NODE_ENV || 'development',
  
  // Trust proxy settings for reverse proxies
  trustProxy: process.env.TRUST_PROXY === 'true'
};

// Auth Configuration
export const authConfig = {
  // Bcrypt rounds for password hashing
  hashRounds: parseInt(process.env.PASSWORD_HASH_ROUNDS || '10')
};

// Validate critical configuration
export function validateConfig() {
  const missingVars = [];
  
  // Check required database configuration
  if (!dbConfig.connectionString) {
    missingVars.push('DATABASE_URL');
  }
  
  // Check production-required variables
  if (serverConfig.environment === 'production') {
    if (!sessionConfig.secret || sessionConfig.secret === 'dev-key-not-for-production') {
      missingVars.push('SESSION_SECRET');
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}