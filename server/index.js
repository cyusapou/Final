/**
 * ============================================================
 * SERVER ENTRY POINT
 * ============================================================
 * Main server startup and configuration
 */

const http = require('http');
const app = require('./app');
const config = require('./config');
const { initializeDataDirectory } = require('./db/fileStore');
const { initializeState, setupShutdownHandlers } = require('./state');
const { startSyncScheduler } = require('./state/syncScheduler');

/**
 * Start HTTP server
 */
const server = http.createServer(app);

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[fas fa-stop-circle] Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('[fas fa-power-off] HTTP server closed');
    
    // Force sync all data
    const { forceSyncAll } = require('./state/syncScheduler');
    await forceSyncAll();
    
    console.log('[fas fa-check-circle] Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('[fas fa-exclamation-triangle] Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

/**
 * Create superadmin account if none exists
 */
const createSuperAdminIfNeeded = async () => {
  const { getCollection } = require('./state');
  const portalUsers = getCollection('portalUsers');
  const superAdminExists = portalUsers.some(user => user.role === config.ROLES.SUPERADMIN);
  
  if (!superAdminExists) {
    console.log(`\n[fas fa-shield-alt] INITIAL SETUP REQUIRED:`);
    console.log(`   No SuperAdmin found. One will be created automatically.`);
    console.log(`   Login: superadmin`);
    console.log(`   Password: ${config.SUPERADMIN_INITIAL_PASSWORD}`);
    console.log(`   [fas fa-exclamation-triangle] CHANGE THIS PASSWORD ON FIRST LOGIN!`);
    
    // Auto-create superadmin
    const bcrypt = require('bcryptjs');
    const { insertOne } = require('./db/fileStore');
    
    const hashedPassword = await bcrypt.hash(config.SUPERADMIN_INITIAL_PASSWORD, 12);
    
    const superAdmin = {
      username: 'superadmin',
      password: hashedPassword,
      role: config.ROLES.SUPERADMIN,
      status: 'active',
      forcePasswordChange: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await insertOne('portalUsers', superAdmin);
    console.log(`[fas fa-check-circle] SuperAdmin account created automatically`);
  }
};

/**
 * Main startup function
 */
const startServer = async () => {
  try {
    console.log('[fas fa-rocket] Starting On The Go Backend Server...');
    console.log(`[fas fa-chart-bar] Environment: ${config.NODE_ENV}`);
    console.log(`[fas fa-folder] Data Directory: ${config.DATA_DIR}`);
    
    // Step 1: Initialize data directory
    await initializeDataDirectory();
    
    // Step 2: Load all data into memory state
    await initializeState();
    
    // Step 3: Start sync scheduler
    startSyncScheduler();
    
    // Step 4: Setup shutdown handlers
    setupShutdownHandlers();
    
    // Step 5: Create superadmin if needed
    await createSuperAdminIfNeeded();
    
    // Step 6: Start HTTP server
    server.listen(config.PORT, () => {
      console.log(`\n[fas fa-bus] On The Go Server running successfully!`);
      console.log(`[fas fa-globe] Server: http://localhost:${config.PORT}`);
      console.log(`[fas fa-heartbeat] Health Check: http://localhost:${config.PORT}/health`);
      console.log(`[fas fa-link] API Base: http://localhost:${config.PORT}/api/v1`);
      console.log(`[fas fa-flask] API Test: http://localhost:${config.PORT}/api/v1/test`);
      console.log(`[fas fa-desktop] Portals: http://localhost:${config.PORT}/portals`);
      
      // Log system statistics
      const { getSystemStats } = require('./state');
      const stats = getSystemStats();
      
      console.log(`\n[fas fa-chart-bar] System Statistics:`);
      console.log(`   Companies: ${stats.companies}`);
      console.log(`   Buses: ${stats.buses}`);
      console.log(`   Routes: ${stats.routes}`);
      console.log(`   Trips: ${stats.trips}`);
      console.log(`   Drivers: ${stats.drivers}`);
      console.log(`   Workers: ${stats.workers}`);
      console.log(`   Managers: ${stats.managers}`);
      console.log(`   Portal Users: ${stats.portalUsers}`);
      console.log(`   Active Trips: ${stats.activeTrips}`);
      console.log(`   Active Buses: ${stats.activeBuses}`);
      console.log(`   Total Bookings: ${stats.totalBookings}`);
      console.log(`   Total Revenue: RWF ${stats.totalRevenue.toLocaleString()}`);
      
      console.log(`\n[fas fa-trophy] Server is ready to accept connections!`);
      console.log(`[fas fa-file-alt] Logs: All operations are logged with FontAwesome icon prefixes`);
      console.log(`[fas fa-sync] Auto-sync: Every ${config.SYNC_INTERVAL_MS / 1000} seconds`);
      console.log(`[fas fa-shield-alt] Security: JWT authentication + RBAC + Rate limiting`);
      console.log(`[fas fa-database] Persistence: JSON files with in-memory caching`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[fas fa-times-circle] Port ${config.PORT} is already in use`);
        console.error(`   Try: npm run server:dev -- --port ${config.PORT + 1}`);
        process.exit(1);
      } else {
        console.error('[fas fa-times-circle] Server error:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('[fas fa-times-circle] Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[fas fa-bomb] Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('[fas fa-bomb] Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Setup signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();
