/**
 * ============================================================
 * RATE LIMITING MIDDLEWARE
 * ============================================================
 * Basic rate limiting per IP and token
 */

const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * In-memory store for rate limits
 */
const tokenStore = new Map();
const ipStore = new Map();

/**
 * Cleanup old entries from stores
 * @param {Map} store - Store to clean
 */
const cleanupStore = (store) => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (now - data.resetTime > 0) {
      store.delete(key);
    }
  }
};

/**
 * Token-based rate limiting
 * Limits requests per authenticated user/token
 */
const tokenRateLimit = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (req) => {
    // Use token for authenticated requests
    return req.user ? req.user.token : req.ip;
  },
  handler: (req, res) => {
    const message = req.user 
      ? `Too many requests for this user. Maximum ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW_MS / 1000} seconds.`
      : `Too many requests from this IP. Maximum ${config.RATE_LIMIT_MAX_REQUESTS} requests per ${config.RATE_LIMIT_WINDOW_MS / 1000} seconds.`;
    
    console.warn(`⚠️ Rate limit exceeded: ${req.ip} ${req.user ? `(user: ${req.user.username})` : ''}`);
    
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: message,
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW_MS / 1000)
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Login-specific rate limiting
 * More restrictive for authentication endpoints
 */
const loginRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.LOGIN_RATE_LIMIT_MAX,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    console.warn(`⚠️ Login rate limit exceeded: ${req.ip}`);
    
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many login attempts. Maximum ${config.LOGIN_RATE_LIMIT_MAX} attempts per hour. Please try again later.`,
      retryAfter: 3600 // 1 hour
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * API-specific rate limiting for sensitive operations
 * @param {number} maxRequests - Maximum requests per window
 * @param {number} windowMs - Window in milliseconds
 * @returns {Function} Express middleware
 */
const createCustomRateLimit = (maxRequests, windowMs) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req) => req.user ? req.user.token : req.ip,
    handler: (req, res) => {
      console.warn(`⚠️ Custom rate limit exceeded: ${req.ip} ${req.user ? `(user: ${req.user.username})` : ''}`);
      
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Cleanup old rate limit entries periodically
 */
const startCleanupScheduler = () => {
  setInterval(() => {
    cleanupStore(tokenStore);
    cleanupStore(ipStore);
  }, 60000); // Clean every minute
};

module.exports = {
  tokenRateLimit,
  loginRateLimit,
  createCustomRateLimit,
  startCleanupScheduler
};
