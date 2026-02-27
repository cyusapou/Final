/**
 * ============================================================
 * ROLE GUARD MIDDLEWARE
 * ============================================================
 * Role-based access control (RBAC) for portal endpoints
 */

const config = require('../config');

/**
 * Check if user has required role level
 * @param {string} userRole - User's role
 * @param {string|Array} requiredRoles - Required role(s)
 * @returns {boolean} True if user has required role level
 */
const hasRequiredRole = (userRole, requiredRoles) => {
  const userLevel = config.ROLE_LEVELS[userRole] || 0;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.some(role => {
      const requiredLevel = config.ROLE_LEVELS[role] || 0;
      return userLevel >= requiredLevel;
    });
  }
  
  const requiredLevel = config.ROLE_LEVELS[requiredRoles] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Check if user has specific permission
 * @param {Array} userPermissions - User's permissions array
 * @param {string} requiredPermission - Required permission
 * @returns {boolean} True if user has permission
 */
const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 * @param {Array} userPermissions - User's permissions array
 * @param {Array} requiredPermissions - Required permissions array
 * @returns {boolean} True if user has any required permission
 */
const hasAnyPermission = (userPermissions, requiredPermissions) => {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  );
};

/**
 * Role guard middleware factory
 * @param {string|Array} roles - Required role(s)
 * @param {Array} permissions - Required permissions (optional)
 * @returns {Function} Express middleware
 */
const requireRole = (roles, permissions = null) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: config.MESSAGES.AUTH_REQUIRED
      });
    }
    
    // Check role requirements
    if (!hasRequiredRole(req.user.role, roles)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient role privileges for this action'
      });
    }
    
    // Check permission requirements (if specified)
    if (permissions && !hasAnyPermission(req.user.permissions, permissions)) {
      return res.status(403).json({
        success: false,
        error: 'INSUFFICIENT_PERMISSIONS',
        message: 'Insufficient permissions for this action'
      });
    }
    
    // User has required role and permissions
    console.log(`🛡️ Role guard passed: ${req.user.username} (${req.user.role})`);
    next();
  };
};

/**
 * Company isolation middleware
 * Ensures users can only access their company's data
 * @returns {Function} Express middleware
 */
const requireCompanyAccess = (req, res, next) => {
  // Skip for superadmin
  if (req.user.role === config.ROLES.SUPERADMIN) {
    return next();
  }
  
  // Check if user has companyId
  if (!req.user.companyId) {
    return res.status(403).json({
      success: false,
      error: 'INSUFFICIENT_PERMISSIONS',
      message: 'User is not assigned to a company'
    });
  }
  
  // Add companyId filter to query parameters
  if (req.query && !req.query.companyId) {
    req.query.companyId = req.user.companyId;
  }
  
  // Add companyId to request body for POST/PUT requests
  if (req.body && !req.body.companyId) {
    req.body.companyId = req.user.companyId;
  }
  
  console.log(`🏢 Company access enforced: ${req.user.companyId}`);
  next();
};

/**
 * Super admin only middleware
 */
const requireSuperAdmin = requireRole(config.ROLES.SUPERADMIN);

/**
 * Admin only middleware (admin and above)
 */
const requireAdmin = requireRole([config.ROLES.ADMIN, config.ROLES.SUPERADMIN]);

/**
 * Manager only middleware (manager and above)
 */
const requireManager = requireRole([config.ROLES.MANAGER, config.ROLES.ADMIN, config.ROLES.SUPERADMIN]);

/**
 * Worker only middleware (worker and above)
 */
const requireWorker = requireRole([config.ROLES.WORKER, config.ROLES.MANAGER, config.ROLES.ADMIN, config.ROLES.SUPERADMIN]);

/**
 * Driver only middleware (driver and above)
 */
const requireDriver = requireRole([config.ROLES.DRIVER, config.ROLES.WORKER, config.ROLES.MANAGER, config.ROLES.ADMIN, config.ROLES.SUPERADMIN]);

/**
 * Financial access middleware
 * Requires specific financial permissions
 */
const requireFinancialAccess = requireRole(
  [config.ROLES.ADMIN, config.ROLES.SUPERADMIN],
  ['financial_read', 'financial_write']
);

/**
 * Staff management access middleware
 * Requires staff management permissions
 */
const requireStaffManagement = requireRole(
  [config.ROLES.ADMIN, config.ROLES.SUPERADMIN],
  ['staff_read', 'staff_write']
);

/**
 * Content management access middleware
 * Requires content management permissions
 */
const requireContentManagement = requireRole(
  [config.ROLES.ADMIN, config.ROLES.SUPERADMIN],
  ['content_read', 'content_write']
);

/**
 * Custom permission check middleware factory
 * @param {Array} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware
 */
const requirePermissions = (requiredPermissions) => {
  return requireRole(
    [config.ROLES.MANAGER, config.ROLES.ADMIN, config.ROLES.SUPERADMIN],
    requiredPermissions
  );
};

module.exports = {
  hasRequiredRole,
  hasPermission,
  hasAnyPermission,
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
};
