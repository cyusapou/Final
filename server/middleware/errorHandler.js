/**
 * ============================================================
 * CENTRALIZED ERROR HANDLER
 * ============================================================
 * Handles all errors consistently across the application
 */

const config = require('../config');

/**
 * Error handler middleware
 * Catches all errors and returns consistent response format
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user ? req.user.username : 'anonymous',
    ip: req.ip
  });
  
  // Handle different error types
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details || {}
    });
  }
  
  if (err.code === 'AUTH_REQUIRED' || err.code === 'AUTH_INVALID' || err.code === 'AUTH_EXPIRED') {
    return res.status(401).json({
      success: false,
      error: err.code,
      message: config.MESSAGES[err.code] || err.message
    });
  }
  
  if (err.code === 'INSUFFICIENT_PERMISSIONS') {
    return res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSIONS',
      message: err.message || config.MESSAGES.INSUFFICIENT_PERMISSIONS
    });
  }
  
  if (err.code === 'RESOURCE_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: 'RESOURCE_NOT_FOUND',
      message: err.message || config.MESSAGES.RESOURCE_NOT_FOUND
    });
  }
  
  if (err.code === 'RATE_LIMIT_EXCEEDED') {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: err.message || config.MESSAGES.RATE_LIMIT_EXCEEDED,
      retryAfter: err.retryAfter || 60
    });
  }
  
  if (err.code === 'COMPANY_SUSPENDED') {
    return res.status(403).json({
      success: false,
      error: 'COMPANY_SUSPENDED',
      message: config.MESSAGES.COMPANY_SUSPENDED
    });
  }
  
  if (err.code === 'LICENSE_EXPIRED') {
    return res.status(403).json({
      success: false,
      error: 'LICENSE_EXPIRED',
      message: config.MESSAGES.LICENSE_EXPIRED
    });
  }
  
  if (err.code === 'MAINTENANCE_MODE') {
    return res.status(503).json({
      success: false,
      error: 'MAINTENANCE_MODE',
      message: config.MESSAGES.MAINTENANCE_MODE
    });
  }
  
  // Default server error
  return res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: config.MESSAGES.SERVER_ERROR,
    details: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      message: err.message
    } : {}
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.url}`);
  
  return res.status(404).json({
    success: false,
    error: 'RESOURCE_NOT_FOUND',
    message: config.MESSAGES.RESOURCE_NOT_FOUND,
    details: {
      method: req.method,
      url: req.url,
      availableEndpoints: getAvailableEndpoints(req)
    }
  });
};

/**
 * Get list of available endpoints for help
 * @param {Object} req - Express request object
 * @returns {Array} List of available endpoints
 */
const getAvailableEndpoints = (req) => {
  const baseUrl = '/api/v1';
  
  if (req.path.startsWith('/api/v1/public/')) {
    return [
      'GET /api/v1/public/stations',
      'GET /api/v1/public/routes',
      'GET /api/v1/public/trips/live',
      'GET /api/v1/public/content',
      'GET /api/v1/public/announcements'
    ];
  }
  
  if (req.path.startsWith('/api/v1/auth/')) {
    return [
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/refresh',
      'POST /api/v1/auth/logout',
      'POST /api/v1/auth/change-password',
      'GET /api/v1/auth/me'
    ];
  }
  
  return [
    'GET /api/v1/public/stations',
    'POST /api/v1/auth/login',
    'Check your authentication and try again'
  ];
};

/**
 * Async error wrapper for route handlers
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler
 */
const asyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Paginated response helper
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total: pagination.total || data.length,
      page: pagination.page || 1,
      limit: pagination.limit || 20,
      totalPages: Math.ceil((pagination.total || data.length) / (pagination.limit || 20))
    },
    message
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  successResponse,
  paginatedResponse
};
