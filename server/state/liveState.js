/**
 * ============================================================
 * IN-MEMORY STATE LAYER
 * ============================================================
 * Fast in-memory data store that syncs to disk periodically.
 * All API reads hit this layer for maximum performance.
 * Writes mark collections as "dirty" for batch syncing.
 */

const config = require('../config');
const { readCollection } = require('../db/fileStore');

// Main state object - mirrors the JSON file structure
const state = {
  companies: [],
  buses: [],
  routes: [],
  trips: [],
  drivers: [],
  workers: [],
  managers: [],
  portalUsers: [],
  bookings: [],
  payments: [],
  incidents: [],
  maintenance: [],
  announcements: [],
  promotions: [],
  content: {},
  analyticsSnapshots: [],
  auditLog: [],
  settings: {}
};

// Track which collections need to be written to disk
const dirtyCollections = new Set();

/**
 * Mark a collection as dirty (needs sync to disk)
 * @param {string} collectionName - Name of the collection
 */
const markDirty = (collectionName) => {
  dirtyCollections.add(collectionName);
  console.log(`[fas fa-edit] Marked ${collectionName} as dirty`);
};

/**
 * Check if a collection is dirty
 * @param {string} collectionName - Name of the collection
 * @returns {boolean} True if collection needs syncing
 */
const isDirty = (collectionName) => {
  return dirtyCollections.has(collectionName);
};

/**
 * Get all dirty collections for syncing
 * @returns {Array<string>} Array of dirty collection names
 */
const getDirtyCollections = () => {
  return Array.from(dirtyCollections);
};

/**
 * Clear dirty flag for a collection
 * @param {string} collectionName - Name of the collection
 */
const clearDirty = (collectionName) => {
  dirtyCollections.delete(collectionName);
};

/**
 * Get entire state object (for debugging)
 * @returns {Object} Complete state
 */
const getState = () => {
  return { ...state };
};

/**
 * Get specific collection from state
 * @param {string} collectionName - Name of the collection
 * @returns {Array|Object} Collection data
 */
const getCollection = (collectionName) => {
  return state[collectionName];
};

/**
 * Set entire collection in state
 * @param {string} collectionName - Name of the collection
 * @param {Array|Object} data - Collection data
 */
const setCollection = (collectionName, data) => {
  state[collectionName] = data;
  markDirty(collectionName);
};

/**
 * Add item to collection
 * @param {string} collectionName - Name of the collection
 * @param {Object} item - Item to add
 */
const addToCollection = (collectionName, item) => {
  state[collectionName].push(item);
  markDirty(collectionName);
};

/**
 * Update item in collection by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Item ID
 * @param {Object} updates - Updates to merge
 */
const updateInCollection = (collectionName, id, updates) => {
  const index = state[collectionName].findIndex(item => item.id === id);
  if (index !== -1) {
    state[collectionName][index] = {
      ...state[collectionName][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    markDirty(collectionName);
    return state[collectionName][index];
  }
  return null;
};

/**
 * Remove item from collection by ID (soft delete)
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Item ID
 */
const removeFromCollection = (collectionName, id) => {
  const index = state[collectionName].findIndex(item => item.id === id);
  if (index !== -1) {
    state[collectionName][index].deleted = true;
    state[collectionName][index].deletedAt = new Date().toISOString();
    markDirty(collectionName);
    return true;
  }
  return false;
};

/**
 * Hard remove item from collection by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Item ID
 */
const hardRemoveFromCollection = (collectionName, id) => {
  const index = state[collectionName].findIndex(item => item.id === id);
  if (index !== -1) {
    state[collectionName].splice(index, 1);
    markDirty(collectionName);
    return true;
  }
  return false;
};

/**
 * Find item in collection by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Item ID
 * @returns {Object|null} Found item or null
 */
const findInCollection = (collectionName, id) => {
  return state[collectionName].find(item => item.id === id) || null;
};

/**
 * Filter collection by predicate
 * @param {string} collectionName - Name of the collection
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered items
 */
const filterCollection = (collectionName, predicate) => {
  return state[collectionName].filter(predicate);
};

/**
 * Add audit log entry
 * @param {Object} auditEntry - Audit log entry
 */
const addAuditLog = (auditEntry) => {
  const entry = {
    id: require('nanoid')(),
    timestamp: new Date().toISOString(),
    ...auditEntry
  };
  
  state.auditLog.push(entry);
  markDirty('auditLog');
  
  console.log(`[fas fa-clipboard-list] Audit log: ${entry.action} by ${entry.actorRole} on ${entry.entityType}`);
};

/**
 * Initialize state from disk on server startup
 * @returns {Promise<void>}
 */
const initializeState = async () => {
  try {
    console.log('[fas fa-rocket] Loading state from disk...');
    
    // Load all collections from JSON files
    const collections = [
      'companies', 'buses', 'routes', 'trips', 'drivers',
      'workers', 'managers', 'portalUsers', 'bookings',
      'payments', 'incidents', 'maintenance', 'announcements',
      'promotions', 'content', 'analyticsSnapshots', 'auditLog', 'settings', 'pricingPlans'
    ];
    
    for (const collection of collections) {
      const data = await readCollection(collection);
      state[collection] = data;
      console.log(`[fas fa-chart-bar] Loaded ${collection}: ${Array.isArray(data) ? data.length : Object.keys(data).length} items`);
    }
    
    console.log('[fas fa-check-circle] State loaded successfully');
  } catch (error) {
    console.error('[fas fa-times-circle] Error initializing state:', error.message);
  }
};

/**
 * Get system statistics
 * @returns {Object} System overview statistics
 */
const getSystemStats = () => {
  return {
    companies: state.companies.length,
    buses: state.buses.length,
    routes: state.routes.length,
    trips: state.trips.length,
    drivers: state.drivers.length,
    workers: state.workers.length,
    managers: state.managers.length,
    portalUsers: state.portalUsers.length,
    activeTrips: state.trips.filter(trip => 
      ['scheduled', 'boarding', 'in_progress'].includes(trip.status)
    ).length,
    activeBuses: state.buses.filter(bus => bus.status === 'active').length,
    totalBookings: state.bookings.length,
    totalRevenue: state.payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
  };
};

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
  
  // Initialization
  initializeState
};
