/**
 * ============================================================
 * AUTHENTICATION SERVICE
 * ============================================================
 * Business logic for authentication and user management
 */

const bcrypt = require('bcryptjs');
const config = require('../config');
const { 
  findInCollection,
  updateInCollection,
  insertOne,
  filterCollection
} = require('../state');
const { logSystemAction } = require('../middleware');

/**
 * Create new portal user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user or error
 */
const createPortalUser = async (userData) => {
  try {
    // Check if username already exists
    const existingUser = findInCollection('portalUsers', user => 
      user.username === userData.username
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'USERNAME_TAKEN',
        message: 'Username already exists'
      };
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Create user object
    const newUser = {
      username: userData.username,
      password: hashedPassword,
      role: userData.role,
      companyId: userData.companyId || null,
      permissions: userData.permissions || [],
      status: 'active',
      forcePasswordChange: userData.forcePasswordChange || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to database
    const createdUser = await insertOne('portalUsers', newUser);
    
    if (!createdUser) {
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to create user'
      };
    }
    
    // Log system action
    logSystemAction({
      action: 'CREATE_USER',
      entityType: 'portalUser',
      entityId: createdUser.id,
      details: {
        username: userData.username,
        role: userData.role,
        companyId: userData.companyId
      }
    });
    
    console.log(`👤 Created portal user: ${userData.username} (${userData.role})`);
    
    return {
      success: true,
      data: createdUser
    };
    
  } catch (error) {
    console.error('❌ Error creating portal user:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create user'
    };
  }
};

/**
 * Update portal user
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated user or error
 */
const updatePortalUser = async (userId, updates) => {
  try {
    // Don't allow password updates through this method
    const { password, ...safeUpdates } = updates;
    
    // Hash password if provided
    if (password) {
      safeUpdates.password = await bcrypt.hash(password, 12);
    }
    
    // Add updated timestamp
    safeUpdates.updatedAt = new Date().toISOString();
    
    const updatedUser = await updateInCollection('portalUsers', userId, safeUpdates);
    
    if (!updatedUser) {
      return {
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'User not found'
      };
    }
    
    console.log(`📝 Updated portal user: ${userId}`);
    
    return {
      success: true,
      data: updatedUser
    };
    
  } catch (error) {
    console.error('❌ Error updating portal user:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to update user'
    };
  }
};

/**
 * Deactivate portal user
 * @param {string} userId - User ID
 * @param {string} reason - Deactivation reason
 * @returns {Promise<Object>} Result
 */
const deactivatePortalUser = async (userId, reason) => {
  try {
    const updatedUser = await updateInCollection('portalUsers', userId, {
      status: 'inactive',
      deactivationReason: reason,
      deactivatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    if (!updatedUser) {
      return {
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'User not found'
      };
    }
    
    // Log system action
    logSystemAction({
      action: 'DEACTIVATE_USER',
      entityType: 'portalUser',
      entityId: userId,
      details: { reason }
    });
    
    console.log(`🚫 Deactivated portal user: ${userId}`);
    
    return {
      success: true,
      data: updatedUser
    };
    
  } catch (error) {
    console.error('❌ Error deactivating portal user:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to deactivate user'
    };
  }
};

/**
 * Get users by company
 * @param {string} companyId - Company ID
 * @param {string} role - Optional role filter
 * @returns {Promise<Array>} Array of users
 */
const getUsersByCompany = async (companyId, role = null) => {
  try {
    let users = filterCollection('portalUsers', user => 
      user.companyId === companyId
    );
    
    // Filter by role if specified
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Remove sensitive data
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return safeUsers;
    
  } catch (error) {
    console.error('❌ Error getting users by company:', error);
    return [];
  }
};

/**
 * Get user permissions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of permissions
 */
const getUserPermissions = async (userId) => {
  try {
    const user = findInCollection('portalUsers', userId);
    
    if (!user) {
      return [];
    }
    
    return user.permissions || [];
    
  } catch (error) {
    console.error('❌ Error getting user permissions:', error);
    return [];
  }
};

/**
 * Update user permissions
 * @param {string} userId - User ID
 * @param {Array} permissions - New permissions
 * @returns {Promise<Object>} Result
 */
const updateUserPermissions = async (userId, permissions) => {
  try {
    const updatedUser = await updateInCollection('portalUsers', userId, {
      permissions: permissions || [],
      updatedAt: new Date().toISOString()
    });
    
    if (!updatedUser) {
      return {
        success: false,
        error: 'RESOURCE_NOT_FOUND',
        message: 'User not found'
      };
    }
    
    // Log system action
    logSystemAction({
      action: 'UPDATE_PERMISSIONS',
      entityType: 'portalUser',
      entityId: userId,
      details: { permissions }
    });
    
    console.log(`🔐 Updated permissions for user: ${userId}`);
    
    return {
      success: true,
      data: updatedUser
    };
    
  } catch (error) {
    console.error('❌ Error updating user permissions:', error);
    return {
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to update permissions'
    };
  }
};

/**
 * Validate user session
 * @param {string} userId - User ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Validation result
 */
const validateUserSession = async (userId, token) => {
  try {
    const user = findInCollection('portalUsers', userId);
    
    if (!user) {
      return {
        valid: false,
        reason: 'USER_NOT_FOUND'
      };
    }
    
    if (user.status !== 'active') {
      return {
        valid: false,
        reason: 'USER_INACTIVE'
      };
    }
    
    if (user.forcePasswordChange) {
      return {
        valid: true,
        requiresPasswordChange: true
      };
    }
    
    return {
      valid: true,
      requiresPasswordChange: false
    };
    
  } catch (error) {
    console.error('❌ Error validating user session:', error);
    return {
      valid: false,
      reason: 'VALIDATION_ERROR'
    };
  }
};

/**
 * Get user statistics
 * @param {string} companyId - Optional company ID filter
 * @returns {Promise<Object>} User statistics
 */
const getUserStatistics = async (companyId = null) => {
  try {
    let users = filterCollection('portalUsers', user => user.status === 'active');
    
    if (companyId) {
      users = users.filter(user => user.companyId === companyId);
    }
    
    const stats = {
      total: users.length,
      byRole: {},
      byStatus: {},
      recentLogins: users
        .filter(user => user.lastLoginAt)
        .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
        .slice(0, 10)
        .map(user => ({
          username: user.username,
          role: user.role,
          lastLoginAt: user.lastLoginAt
        }))
    };
    
    // Count by role
    Object.values(config.ROLES).forEach(role => {
      stats.byRole[role] = users.filter(user => user.role === role).length;
    });
    
    // Count by status
    ['active', 'inactive', 'suspended'].forEach(status => {
      stats.byStatus[status] = users.filter(user => user.status === status).length;
    });
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error getting user statistics:', error);
    return {
      total: 0,
      byRole: {},
      byStatus: {},
      recentLogins: []
    };
  }
};

module.exports = {
  createPortalUser,
  updatePortalUser,
  deactivatePortalUser,
  getUsersByCompany,
  getUserPermissions,
  updateUserPermissions,
  validateUserSession,
  getUserStatistics
};
