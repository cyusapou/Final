/**
 * ============================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================
 * JWT-based authentication for all portal endpoints
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { findInCollection } = require('../state');

/**
 * Authentication middleware
 * Verifies JWT token and sets user context in request
 */
const authenticate = async (req, res, next) => {
  try {
    // Skip authentication for public routes
    if (req.path.startsWith('/api/v1/public/') || req.path === '/api/v1/auth/login') {
      return next();
    }
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: config.MESSAGES.AUTH_REQUIRED
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Find the portal user
    const portalUser = findInCollection('portalUsers', decoded.userId);
    
    if (!portalUser) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID',
        message: config.MESSAGES.AUTH_INVALID
      });
    }
    
    // Check if user is active
    if (portalUser.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INACTIVE',
        message: 'Your account has been deactivated'
      });
    }
    
    // Check if token is blacklisted
    const { getCollection } = require('../state');
    const settings = getCollection('settings');
    const blacklistedTokens = settings.blacklistedTokens || [];
    
    if (blacklistedTokens.includes(token)) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_BLACKLISTED',
        message: 'Token has been invalidated'
      });
    }
    
    // Set user context in request
    req.user = {
      id: portalUser.id,
      username: portalUser.username,
      role: portalUser.role,
      companyId: portalUser.companyId,
      permissions: portalUser.permissions || [],
      token: token
    };
    
    console.log(`🔐 Authenticated: ${portalUser.username} (${portalUser.role})`);
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_EXPIRED',
        message: config.MESSAGES.AUTH_EXPIRED
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_INVALID',
        message: config.MESSAGES.AUTH_INVALID
      });
    }
    
    console.error('❌ Authentication error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: config.MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 * Sets user context if valid token exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user context
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const portalUser = findInCollection('portalUsers', decoded.userId);
    
    if (portalUser && portalUser.status === 'active') {
      req.user = {
        id: portalUser.id,
        username: portalUser.username,
        role: portalUser.role,
        companyId: portalUser.companyId,
        permissions: portalUser.permissions || [],
        token: token
      };
    }
    
    next();
  } catch (error) {
    // Silently continue without user context
    next();
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    companyId: user.companyId,
    permissions: user.permissions || []
  };
  
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

/**
 * Add token to blacklist (for logout)
 * @param {string} token - Token to blacklist
 */
const blacklistToken = async (token) => {
  const { getCollection, updateInCollection } = require('../state');
  const settings = getCollection('settings');
  
  const blacklistedTokens = settings.blacklistedTokens || [];
  blacklistedTokens.push(token);
  
  await updateInCollection('settings', 'settings', {
    ...settings,
    blacklistedTokens
  });
  
  console.log('🚫 Token blacklisted');
};

/**
 * Remove token from blacklist (for admin override)
 * @param {string} token - Token to remove from blacklist
 */
const unblacklistToken = async (token) => {
  const { getCollection, updateInCollection } = require('../state');
  const settings = getCollection('settings');
  
  const blacklistedTokens = (settings.blacklistedTokens || [])
    .filter(t => t !== token);
  
  await updateInCollection('settings', 'settings', {
    ...settings,
    blacklistedTokens
  });
  
  console.log('✅ Token removed from blacklist');
};

/**
 * Refresh token (generate new token for existing user)
 * @param {string} token - Current token
 * @returns {Object} Result with new token or error
 */
const refreshToken = async (token) => {
  try {
    // Verify current token (even if expired)
    const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
    const portalUser = findInCollection('portalUsers', decoded.userId);
    
    if (!portalUser || portalUser.status !== 'active') {
      return {
        success: false,
        error: 'AUTH_INVALID',
        message: config.MESSAGES.AUTH_INVALID
      };
    }
    
    // Generate new token
    const newToken = generateToken(portalUser);
    
    console.log(`🔄 Token refreshed for: ${portalUser.username}`);
    
    return {
      success: true,
      data: {
        token: newToken,
        user: {
          id: portalUser.id,
          username: portalUser.username,
          role: portalUser.role,
          companyId: portalUser.companyId,
          permissions: portalUser.permissions || []
        }
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: config.MESSAGES.SERVER_ERROR
    };
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
  blacklistToken,
  unblacklistToken,
  refreshToken
};
