/**
 * ============================================================
 * AUDIT LOGGER MIDDLEWARE
 * ============================================================
 * Automatically logs all write operations for compliance
 */

const config = require('../config');
const { addAuditLog } = require('../state');

/**
 * Extract relevant information from request for audit logging
 * @param {Object} req - Express request object
 * @param {string} action - Action being performed
 * @param {string} entityType - Type of entity being modified
 * @param {string} entityId - ID of entity being modified
 * @param {Object} before - State before modification
 * @param {Object} after - State after modification
 */
const createAuditEntry = (req, action, entityType, entityId, before = null, after = null) => {
  return {
    action,
    entityType,
    entityId,
    actorId: req.user ? req.user.id : null,
    actorName: req.user ? req.user.username : 'anonymous',
    actorRole: req.user ? req.user.role : 'anonymous',
    companyId: req.user ? req.user.companyId : null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    before,
    after,
    summary: generateSummary(action, entityType, entityId, after)
  };
};

/**
 * Generate human-readable summary for audit entry
 * @param {string} action - Action performed
 * @param {string} entityType - Type of entity
 * @param {string} entityId - Entity ID
 * @param {Object} after - State after action
 * @returns {string} Human-readable summary
 */
const generateSummary = (action, entityType, entityId, after) => {
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  
  switch (action) {
    case 'CREATE':
      return `Created ${entityName} ${entityId}`;
    case 'UPDATE':
      return `Updated ${entityName} ${entityId}`;
    case 'DELETE':
      return `Deleted ${entityName} ${entityId}`;
    case 'LOGIN':
      return `User login`;
    case 'LOGOUT':
      return `User logout`;
    case 'PASSWORD_CHANGE':
      return `Password changed for ${entityName} ${entityId}`;
    case 'STATUS_CHANGE':
      const status = after?.status || 'unknown';
      return `Changed ${entityName} ${entityId} status to ${status}`;
    case 'ASSIGN':
      return `Assigned ${entityName} ${entityId}`;
    case 'UNASSIGN':
      return `Unassigned ${entityName} ${entityId}`;
    default:
      return `${action} on ${entityName} ${entityId}`;
  }
};

/**
 * Audit logger middleware factory
 * @param {string} action - Action to log
 * @param {string} entityType - Entity type being modified
 * @returns {Function} Express middleware
 */
const auditLog = (action, entityType) => {
  return (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    let responseData = null;
    
    // Intercept response to capture data
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    // Continue to next middleware
    next();
    
    // Log after response is sent
    res.on('finish', () => {
      // Only log successful operations
      if (responseData && responseData.success) {
        const entityId = responseData.data?.id || req.params.id || 'unknown';
        const auditEntry = createAuditEntry(req, action, entityType, entityId, null, responseData.data);
        addAuditLog(auditEntry);
      }
    });
  };
};

/**
 * Login audit logger
 * @param {Object} req - Express request object
 * @param {Object} user - User object
 * @param {boolean} success - Whether login was successful
 */
const logLogin = (req, user, success) => {
  const auditEntry = createAuditEntry(req, 'LOGIN', 'user', user.id, null, { 
    username: user.username,
    success,
    timestamp: new Date().toISOString()
  });
  
  addAuditLog(auditEntry);
};

/**
 * Logout audit logger
 * @param {Object} req - Express request object
 */
const logLogout = (req) => {
  const auditEntry = createAuditEntry(req, 'LOGOUT', 'user', req.user.id, null, {
    username: req.user.username,
    timestamp: new Date().toISOString()
  });
  
  addAuditLog(auditEntry);
};

/**
 * Content change audit logger
 * @param {Object} req - Express request object
 * @param {string} section - Content section changed
 * @param {Object} before - Previous content
 * @param {Object} after - New content
 */
const logContentChange = (req, section, before, after) => {
  const auditEntry = createAuditEntry(req, 'UPDATE', 'content', section, before, after);
  addAuditLog(auditEntry);
};

/**
 * System action audit logger
 * @param {Object} req - Express request object
 * @param {string} action - System action
 * @param {Object} details - Action details
 */
const logSystemAction = (req, action, details) => {
  const auditEntry = createAuditEntry(req, action, 'system', 'system', null, details);
  addAuditLog(auditEntry);
};

/**
 * Get audit log statistics
 * @param {Object} filters - Filter criteria
 * @returns {Object} Audit statistics
 */
const getAuditStats = (filters = {}) => {
  const { getCollection, filterCollection } = require('../state');
  const auditLog = getCollection('auditLog');
  
  let filteredLogs = auditLog;
  
  // Apply filters
  if (filters.actorRole) {
    filteredLogs = filteredLogs.filter(log => log.actorRole === filters.actorRole);
  }
  
  if (filters.companyId) {
    filteredLogs = filteredLogs.filter(log => log.companyId === filters.companyId);
  }
  
  if (filters.action) {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }
  
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
  }
  
  // Calculate statistics
  const stats = {
    total: filteredLogs.length,
    byAction: {},
    byActorRole: {},
    byEntityType: {},
    byDate: {},
    recent: filteredLogs.slice(-10).reverse() // Last 10 entries
  };
  
  // Group by action
  filteredLogs.forEach(log => {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
  });
  
  // Group by actor role
  filteredLogs.forEach(log => {
    stats.byActorRole[log.actorRole] = (stats.byActorRole[log.actorRole] || 0) + 1;
  });
  
  // Group by entity type
  filteredLogs.forEach(log => {
    stats.byEntityType[log.entityType] = (stats.byEntityType[log.entityType] || 0) + 1;
  });
  
  // Group by date (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  filteredLogs.forEach(log => {
    const logDate = new Date(log.timestamp).toISOString().split('T')[0];
    if (new Date(log.timestamp) >= sevenDaysAgo) {
      stats.byDate[logDate] = (stats.byDate[logDate] || 0) + 1;
    }
  });
  
  return stats;
};

module.exports = {
  auditLog,
  logLogin,
  logLogout,
  logContentChange,
  logSystemAction,
  getAuditStats
};
