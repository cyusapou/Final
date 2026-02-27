/**
 * ============================================================
 * EXPRESS APP CONFIGURATION
 * ============================================================
 * Main Express application setup with all middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { 
  authenticate, 
  optionalAuth,
  tokenRateLimit,
  loginRateLimit,
  errorHandler,
  notFoundHandler,
  startCleanupScheduler
} = require('./middleware');

/**
 * Create Express application
 */
const app = express();

/**
 * Trust proxy for proper IP detection
 */
app.set('trust proxy', 1);

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

/**
 * CORS configuration
 */
app.use(cors({
  origin: config.CORS_ORIGINS[config.NODE_ENV] || config.CORS_ORIGINS.development,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log(`[fas fa-file-alt] ${timestamp} ${method} ${url} - ${ip} - ${userAgent ? userAgent.substring(0, 50) : 'Unknown'}`);
  
  next();
});

/**
 * Rate limiting middleware
 */
app.use('/api/v1/auth/login', loginRateLimit);
app.use('/api/v1', tokenRateLimit);

/**
 * Health check endpoint (no auth required)
 */
app.get('/health', (req, res) => {
  const { getSystemStats } = require('./state');
  const stats = getSystemStats();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    stats: {
      companies: stats.companies,
      buses: stats.buses,
      routes: stats.routes,
      trips: stats.trips,
      activeTrips: stats.activeTrips,
      activeBuses: stats.activeBuses
    }
  });
});

/**
 * Import route handlers
 */
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const bookingRoutes = require('./routes/bookings');

/**
 * API routes will be mounted here
 * This is where we'll import and mount all route handlers
 */
console.log('[fas fa-road] Setting up API routes...');

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Placeholder for route imports - will be implemented in next steps
app.get('/api/v1/test', (req, res) => {
  res.json({
    success: true,
    message: 'On The Go Backend API is running',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'Authentication: /api/v1/auth/*',
      'Public: /api/v1/public/*',
      'Bookings: /api/v1/bookings/*',
      'Health Check: /health'
    ]
  });
});

/**
 * 404 handler for undefined routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Start rate limiter cleanup scheduler
 */
startCleanupScheduler();

module.exports = app;
