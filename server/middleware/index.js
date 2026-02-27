/**
 * ============================================================
 * MIDDLEWARE LAYER EXPORTS
 * ============================================================
 * Central export point for all middleware functionality
 */

const { authenticate, optionalAuth, generateToken, blacklistToken, unblacklistToken, refreshToken } = require('./auth');
const { 
  requireRole, 
  requireCompanyAccess,
  requireSuperAdmin,
  requireAdmin,
  requireManager,
  requireWorker,
  requireDriver,
  requireFinancialAccess,
  requireStaffManagement,
  requireContentManagement,
  requirePermissions
} = require('./roleGuard');
const { tokenRateLimit, loginRateLimit, createCustomRateLimit, startCleanupScheduler } = require('./rateLimiter');
const { auditLog, logLogin, logLogout, logContentChange, logSystemAction, getAuditStats } = require('./auditLogger');
const { validate, schemas } = require('./validator');
const { errorHandler, notFoundHandler, asyncHandler, successResponse, paginatedResponse } = require('./errorHandler');

module.exports = {
  // Authentication
  authenticate,
  optionalAuth,
  generateToken,
  blacklistToken,
  unblacklistToken,
  refreshToken,
  
  // Role-based access control
  requireRole,
  requireCompanyAccess,
  requireSuperAdmin,
  requireAdmin,
  requireManager,
  requireWorker,
  requireDriver,
  requireFinancialAccess,
  requireStaffManagement,
  requireContentManagement,
  requirePermissions,
  
  // Rate limiting
  tokenRateLimit,
  loginRateLimit,
  createCustomRateLimit,
  startCleanupScheduler,
  
  // Audit logging
  auditLog,
  logLogin,
  logLogout,
  logContentChange,
  logSystemAction,
  getAuditStats,
  
  // Validation
  validate,
  schemas,
  
  // Error handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  successResponse,
  paginatedResponse
};
