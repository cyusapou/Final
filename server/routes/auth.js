/**
 * ============================================================
 * AUTHENTICATION ROUTES
 * ============================================================
 * Portal user login, logout, token refresh, and profile management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { 
  findInCollection,
  updateInCollection,
  addAuditLog
} = require('../state');
const { 
  generateTokens,
  verifyRefreshToken,
  blacklistToken
} = require('../middleware/auth');
const { 
  validateRequired,
  validateEmail,
  validatePassword
} = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Login endpoint
 * Authenticates portal user and returns JWT token
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password, portal } = req.body;
  
  // Validate required fields
  validateRequired(req.body, ['username', 'password']);
  
  // Find user
  const user = findInCollection('portalUsers', u => u.username === username);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password'
    });
  }
  
  // Check if user is active
  if (user.status !== 'active') {
    return res.status(401).json({
      success: false,
      error: 'ACCOUNT_INACTIVE',
      message: 'Account is inactive'
    });
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid username or password'
    });
  }
  
  // Generate tokens
  const tokens = generateTokens(user);
  
  // Update last login
  await updateInCollection('portalUsers', user.id, {
    lastLoginAt: new Date().toISOString()
  });
  
  // Log audit
  addAuditLog({
    action: 'LOGIN',
    entityType: 'portalUser',
    entityId: user.id,
    actorId: user.id,
    details: { username, portal }
  });
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        permissions: user.permissions,
        forcePasswordChange: user.forcePasswordChange
      },
      tokens
    }
  });
}));

/**
 * Refresh token endpoint
 * Generates new access token from refresh token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  validateRequired(req.body, ['refreshToken']);
  
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid or expired refresh token'
    });
  }
  
  // Find user
  const user = findInCollection('portalUsers', decoded.userId);
  
  if (!user || user.status !== 'active') {
    return res.status(401).json({
      success: false,
      error: 'USER_NOT_FOUND',
      message: 'User not found or inactive'
    });
  }
  
  // Generate new tokens
  const tokens = generateTokens(user);
  
  res.json({
    success: true,
    data: { tokens }
  });
}));

/**
 * Logout endpoint
 * Blacklists the refresh token
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  validateRequired(req.body, ['refreshToken']);
  
  // Blacklist refresh token
  blacklistToken(refreshToken);
  
  // Log audit if user is authenticated
  if (req.user) {
    addAuditLog({
      action: 'LOGOUT',
      entityType: 'portalUser',
      entityId: req.user.id,
      actorId: req.user.id
    });
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * Change password endpoint
 * Allows authenticated user to change their password
 */
router.post('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  validateRequired(req.body, ['currentPassword', 'newPassword']);
  validatePassword(newPassword);
  
  // Get user from auth middleware
  const user = req.user;
  
  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_CURRENT_PASSWORD',
      message: 'Current password is incorrect'
    });
  }
  
  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  
  // Update password
  await updateInCollection('portalUsers', user.id, {
    password: hashedNewPassword,
    forcePasswordChange: false,
    updatedAt: new Date().toISOString()
  });
  
  // Log audit
  addAuditLog({
    action: 'CHANGE_PASSWORD',
    entityType: 'portalUser',
    entityId: user.id,
    actorId: user.id
  });
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * Get profile endpoint
 * Returns current user's profile
 */
router.get('/profile', asyncHandler(async (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      permissions: user.permissions,
      status: user.status,
      forcePasswordChange: user.forcePasswordChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt
    }
  });
}));

/**
 * Update profile endpoint
 * Allows user to update their profile information
 */
router.put('/profile', asyncHandler(async (req, res) => {
  const user = req.user;
  const allowedUpdates = ['email', 'phone'];
  const updates = {};
  
  // Only allow specific fields to be updated
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'No valid fields to update'
    });
  }
  
  // Validate email if provided
  if (updates.email) {
    validateEmail(updates.email);
  }
  
  // Update user
  const updatedUser = await updateInCollection('portalUsers', user.id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
  
  // Log audit
  addAuditLog({
    action: 'UPDATE_PROFILE',
    entityType: 'portalUser',
    entityId: user.id,
    actorId: user.id,
    details: updates
  });
  
  res.json({
    success: true,
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      permissions: updatedUser.permissions,
      status: updatedUser.status,
      forcePasswordChange: updatedUser.forcePasswordChange,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastLoginAt: updatedUser.lastLoginAt,
      ...updates
    }
  });
}));

module.exports = router;
