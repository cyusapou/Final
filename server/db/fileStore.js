/**
 * ============================================================
 * DATABASE ADAPTER LAYER — EASY SWAP GUIDE
 * ============================================================
 * This file is the ONLY place that reads/writes data from the filesystem.
 * To switch from flat files to a real database:
 *
 * 1. MongoDB: Replace readCollection/writeCollection with
 *    mongoose model calls. Keep all function signatures identical.
 *
 * 2. PostgreSQL: Replace with pg pool.query() calls.
 *    Each "collection" maps to a table.
 *
 * 3. Supabase/Firebase: Replace with their SDK calls.
 *
 * Business logic in /services/ and routes in /routes/
 * will work WITHOUT ANY CHANGES after swapping this file.
 * ============================================================
 */

const fs = require('fs').promises;
const path = require('path');
const { nanoid } = require('nanoid');
const config = require('../config');

/**
 * Core file-based database operations
 * All functions return Promises for async/await compatibility
 */

/**
 * Convert camelCase collection name to UPPER_SNAKE_CASE for config lookup
 * @param {string} collectionName - camelCase collection name
 * @returns {string} UPPER_SNAKE_CASE key
 */
const toConfigKey = (collectionName) => {
  // Handle special mappings for collection names with underscores
  const mapping = {
    'portalusers': 'PORTAL_USERS',
    'PRICINGPLANS': 'PRICING_PLANS',
    'analyticssnapshots': 'ANALYTICS_SNAPSHOTS',
    'auditlog': 'AUDIT_LOG'
  };
  
  const upper = collectionName.toUpperCase();
  return mapping[upper] || upper;
};

/**
 * Read entire collection from JSON file
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Array>} Array of documents
 */
const readCollection = async (collectionName) => {
  try {
    const configKey = toConfigKey(collectionName);
    const filePath = config.PATHS[configKey];
    if (!filePath) {
      console.error(`[fas fa-times-circle] No path configured for collection: ${collectionName} (key: ${configKey})`);
      return [];
    }
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`[fas fa-times-circle] Error reading collection ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * Write entire collection to JSON file (atomic operation)
 * @param {string} collectionName - Name of the collection
 * @param {Array} data - Array of documents to write
 * @returns {Promise<boolean>} Success indicator
 */
const writeCollection = async (collectionName, data) => {
  try {
    const configKey = toConfigKey(collectionName);
    const filePath = config.PATHS[configKey];
    if (!filePath) {
      console.error(`[fas fa-times-circle] No path configured for collection: ${collectionName} (key: ${configKey})`);
      return false;
    }
    const tempPath = `${filePath}.tmp`;
    
    // Write to temp file first (atomic operation)
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Rename temp file to actual file
    await fs.rename(tempPath, filePath);
    
    console.log(`[fas fa-save] Saved collection ${collectionName} with ${data.length} items`);
    return true;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error writing collection ${collectionName}:`, error.message);
    return false;
  }
};

/**
 * Find single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Document ID to find
 * @returns {Promise<Object|null>} Document or null if not found
 */
const findById = async (collectionName, id) => {
  try {
    const collection = await readCollection(collectionName);
    return collection.find(item => item.id === id) || null;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error finding by ID in ${collectionName}:`, error.message);
    return null;
  }
};

/**
 * Find documents matching predicate function
 * @param {string} collectionName - Name of the collection
 * @param {Function} predicate - Filter function
 * @returns {Promise<Array>} Array of matching documents
 */
const findWhere = async (collectionName, predicate) => {
  try {
    const collection = await readCollection(collectionName);
    return collection.filter(predicate);
  } catch (error) {
    console.error(`[fas fa-times-circle] Error filtering ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * Insert single document with auto-generated metadata
 * @param {string} collectionName - Name of the collection
 * @param {Object} record - Document to insert
 * @returns {Promise<Object|null>} Inserted document with metadata or null on error
 */
const insertOne = async (collectionName, record) => {
  try {
    const collection = await readCollection(collectionName);
    
    const newRecord = {
      id: nanoid(), // Generate UUID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    };
    
    collection.push(newRecord);
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-chart-bar] Inserted into ${collectionName}:`, newRecord.id);
    return newRecord;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error inserting into ${collectionName}:`, error.message);
    return null;
  }
};

/**
 * Update single document by ID (merge changes)
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Document ID to update
 * @param {Object} changes - Changes to merge
 * @returns {Promise<Object|null>} Updated document or null if not found
 */
const updateOne = async (collectionName, id, changes) => {
  try {
    const collection = await readCollection(collectionName);
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`[fas fa-exclamation-triangle] Document not found in ${collectionName}:`, id);
      return null;
    }
    
    // Merge changes with existing record
    const updatedRecord = {
      ...collection[index],
      ...changes,
      updatedAt: new Date().toISOString() // Always update timestamp
    };
    
    collection[index] = updatedRecord;
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-chart-bar] Updated in ${collectionName}:`, id);
    return updatedRecord;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error updating in ${collectionName}:`, error.message);
    return null;
  }
};

/**
 * Soft delete document (marks as deleted but keeps record)
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Document ID to delete
 * @returns {Promise<boolean>} Success indicator
 */
const deleteOne = async (collectionName, id) => {
  try {
    const collection = await readCollection(collectionName);
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`[fas fa-exclamation-triangle] Document not found for deletion in ${collectionName}:`, id);
      return false;
    }
    
    // Soft delete - mark as deleted but keep record
    collection[index].deleted = true;
    collection[index].deletedAt = new Date().toISOString();
    collection[index].updatedAt = new Date().toISOString();
    
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-trash-alt] Soft deleted from ${collectionName}:`, id);
    return true;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error deleting from ${collectionName}:`, error.message);
    return false;
  }
};

/**
 * Hard delete document (permanent removal)
 * @param {string} collectionName - Name of the collection
 * @param {string} id - Document ID to delete permanently
 * @returns {Promise<boolean>} Success indicator
 */
const hardDelete = async (collectionName, id) => {
  try {
    const collection = await readCollection(collectionName);
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      console.warn(`[fas fa-exclamation-triangle] Document not found for hard delete in ${collectionName}:`, id);
      return false;
    }
    
    // Remove from array permanently
    collection.splice(index, 1);
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-fire] Hard deleted from ${collectionName}:`, id);
    return true;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error hard deleting from ${collectionName}:`, error.message);
    return false;
  }
};

/**
 * Bulk insert multiple documents
 * @param {string} collectionName - Name of the collection
 * @param {Array} records - Array of documents to insert
 * @returns {Promise<Array>} Array of inserted documents with metadata
 */
const bulkInsert = async (collectionName, records) => {
  try {
    const collection = await readCollection(collectionName);
    
    const newRecords = records.map(record => ({
      id: require('nanoid')(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...record
    }));
    
    collection.push(...newRecords);
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-chart-bar] Bulk inserted ${newRecords.length} items into ${collectionName}`);
    return newRecords;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error bulk inserting into ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * Bulk update multiple documents
 * @param {string} collectionName - Name of the collection
 * @param {Array} updates - Array of {id, changes} objects
 * @returns {Promise<Array>} Array of updated documents
 */
const bulkUpdate = async (collectionName, updates) => {
  try {
    const collection = await readCollection(collectionName);
    const updatedRecords = [];
    
    for (const { id, changes } of updates) {
      const index = collection.findIndex(item => item.id === id);
      
      if (index !== -1) {
        collection[index] = {
          ...collection[index],
          ...changes,
          updatedAt: new Date().toISOString()
        };
        updatedRecords.push(collection[index]);
      }
    }
    
    await writeCollection(collectionName, collection);
    
    console.log(`[fas fa-chart-bar] Bulk updated ${updatedRecords.length} items in ${collectionName}`);
    return updatedRecords;
  } catch (error) {
    console.error(`[fas fa-times-circle] Error bulk updating in ${collectionName}:`, error.message);
    return [];
  }
};

/**
 * Initialize data directory and create empty JSON files if they don't exist
 * @returns {Promise<void>}
 */
const initializeDataDirectory = async () => {
  try {
    // Ensure data directory exists
    await fs.mkdir(config.DATA_DIR, { recursive: true });
    
    // Initialize all JSON files with empty arrays/objects
    const collections = [
      'COMPANIES', 'BUSES', 'ROUTES', 'TRIPS', 'DRIVERS', 
      'WORKERS', 'MANAGERS', 'PORTAL_USERS', 'BOOKINGS', 
      'PAYMENTS', 'INCIDENTS', 'MAINTENANCE', 'ANNOUNCEMENTS', 
      'PROMOTIONS', 'ANALYTICS_SNAPSHOTS', 'AUDIT_LOG', 'PRICING_PLANS'
    ];
    
    for (const collection of collections) {
      const filePath = config.PATHS[collection];
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it
        const initialData = collection === 'CONTENT' ? '{}' : '[]';
        await fs.writeFile(filePath, initialData, 'utf8');
        console.log(`[fas fa-folder] Created initial data file: ${collection.toLowerCase()}`);
      }
    }
    
    console.log('[fas fa-rocket] Data directory initialized successfully');
  } catch (error) {
    console.error('[fas fa-times-circle] Error initializing data directory:', error.message);
  }
};

module.exports = {
  readCollection,
  writeCollection,
  findById,
  findWhere,
  insertOne,
  updateOne,
  deleteOne,
  hardDelete,
  bulkInsert,
  bulkUpdate,
  initializeDataDirectory
};
