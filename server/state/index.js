/**
 * ============================================================
 * STATE LAYER EXPORTS
 * ============================================================
 * Central export point for all state management functionality
 */

const { 
  getState,
  getCollection,
  setCollection,
  getSystemStats,
  addToCollection,
  updateInCollection,
  removeFromCollection,
  hardRemoveFromCollection,
  findInCollection,
  filterCollection,
  markDirty,
  isDirty,
  getDirtyCollections,
  clearDirty,
  addAuditLog,
  initializeState
} = require('./liveState');

const {
  startSyncScheduler,
  stopSyncScheduler,
  forceSyncAll,
  syncDirtyCollections,
  getSyncStats,
  setupShutdownHandlers
} = require('./syncScheduler');

module.exports = {
  // State access
  getState,
  getCollection,
  setCollection,
  getSystemStats,
  
  // Collection operations
  addToCollection,
  updateInCollection,
  removeFromCollection,
  hardRemoveFromCollection,
  findInCollection,
  filterCollection,
  
  // Dirty tracking
  markDirty,
  isDirty,
  getDirtyCollections,
  clearDirty,
  
  // Audit logging
  addAuditLog,
  
  // Sync management
  startSyncScheduler,
  stopSyncScheduler,
  forceSyncAll,
  syncDirtyCollections,
  getSyncStats,
  
  // Initialization
  initializeState,
  setupShutdownHandlers
};
