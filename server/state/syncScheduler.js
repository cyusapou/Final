/**
 * ============================================================
 * SYNC SCHEDULER - STATE TO DISK PERSISTENCE
 * ============================================================
 * Periodically flushes dirty state collections to disk.
 * Runs every 30 seconds and on graceful shutdown.
 */

const { writeCollection } = require('../db/fileStore');
const { getCollection, getDirtyCollections, clearDirty } = require('./liveState');
const config = require('../config');

let syncInterval = null;
let isShuttingDown = false;

/**
 * Sync a single collection to disk
 * @param {string} collectionName - Name of the collection to sync
 * @returns {Promise<boolean>} Success indicator
 */
const syncCollection = async (collectionName) => {
  try {
    const data = getCollection(collectionName);
    const success = await writeCollection(collectionName.toLowerCase(), data);
    
    if (success) {
      clearDirty(collectionName);
      console.log(`[fas fa-save] Synced ${collectionName} to disk`);
    }
    
    return success;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error syncing ${collectionName}:`, error.message);
    return false;
  }
};

/**
 * Sync all dirty collections to disk
 * @returns {Promise<void>}
 */
const syncDirtyCollections = async () => {
  if (isShuttingDown) {
    console.log('[fas fa-stop-circle] Skipping sync - server is shutting down');
    return;
  }
  
  const dirtyCollections = getDirtyCollections();
  
  if (dirtyCollections.length === 0) {
    console.log('[fas fa-check-circle] No dirty collections to sync');
    return;
  }
  
  console.log(`[fas fa-sync] Syncing ${dirtyCollections.length} dirty collections...`);
  
  // Sync all dirty collections in parallel
  const syncPromises = dirtyCollections.map(collectionName => 
    syncCollection(collectionName)
  );
  
  const results = await Promise.allSettled(syncPromises);
  
  // Count successful vs failed syncs
  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  const failed = results.length - successful;
  
  if (failed > 0) {
    console.warn(`[fas fa-exclamation-triangle] ${failed} collections failed to sync`);
  } else {
    console.log(`[fas fa-check-circle] Successfully synced ${successful} collections`);
  }
};

/**
 * Start the sync scheduler
 * Runs every SYNC_INTERVAL_MS (default 30 seconds)
 */
const startSyncScheduler = () => {
  if (syncInterval) {
    console.warn('[fas fa-exclamation-triangle] Sync scheduler already running');
    return;
  }
  
  console.log(`[fas fa-clock] Starting sync scheduler (interval: ${config.SYNC_INTERVAL_MS}ms)`);
  
  syncInterval = setInterval(async () => {
    await syncDirtyCollections();
  }, config.SYNC_INTERVAL_MS);
  
  // Initial sync after 5 seconds
  setTimeout(syncDirtyCollections, 5000);
};

/**
 * Stop the sync scheduler
 */
const stopSyncScheduler = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[fas fa-stop-circle] Sync scheduler stopped');
  }
};

/**
 * Force sync all collections (for shutdown)
 * @returns {Promise<void>}
 */
const forceSyncAll = async () => {
  console.log('[fas fa-sync] Force syncing all collections...');
  
  // Mark all collections as dirty for full sync
  const allCollections = [
    'companies', 'buses', 'routes', 'trips', 'drivers',
    'workers', 'managers', 'portalUsers', 'bookings',
    'payments', 'incidents', 'maintenance', 'announcements',
    'promotions', 'content', 'analyticsSnapshots', 'auditLog', 'settings'
  ];
  
  // Import markDirty function to mark all as dirty
  const { markDirty } = require('./liveState');
  allCollections.forEach(collection => markDirty(collection));
  
  await syncDirtyCollections();
  console.log('[fas fa-check-circle] Force sync completed');
};

/**
 * Graceful shutdown handler
 * Syncs all data before process exits
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[fas fa-stop-circle] Received ${signal}. Starting graceful shutdown...`);
  
  isShuttingDown = true;
  
  // Stop sync scheduler
  stopSyncScheduler();
  
  // Force sync all collections
  await forceSyncAll();
  
  console.log('[fas fa-check-circle] Graceful shutdown completed');
  process.exit(0);
};

/**
 * Setup shutdown signal handlers
 */
const setupShutdownHandlers = () => {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon restart
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught Exception:', error);
    await gracefulShutdown('uncaughtException');
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    await gracefulShutdown('unhandledRejection');
  });
};

/**
 * Get sync statistics
 * @returns {Object} Sync status information
 */
const getSyncStats = () => {
  const dirtyCollections = getDirtyCollections();
  return {
    isRunning: !!syncInterval,
    interval: config.SYNC_INTERVAL_MS,
    dirtyCount: dirtyCollections.length,
    dirtyCollections: dirtyCollections,
    lastSync: new Date().toISOString()
  };
};

module.exports = {
  startSyncScheduler,
  stopSyncScheduler,
  forceSyncAll,
  syncDirtyCollections,
  getSyncStats,
  setupShutdownHandlers
};
