/**
 * ============================================================
 * ON THE GO - BACKEND CONFIGURATION
 * ============================================================
 * Central configuration for the entire backend system
 */

const path = require('path');

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Data Directory
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, 'data'),
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'onthego_jwt_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  JWT_REFRESH_WINDOW: process.env.JWT_REFRESH_WINDOW || '24h',
  
  // Sync Configuration
  SYNC_INTERVAL_MS: process.env.SYNC_INTERVAL_MS || 30000, // 30 seconds
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100, // per token
  LOGIN_RATE_LIMIT_MAX: 10, // per IP per hour
  
  // CORS Configuration
  CORS_ORIGINS: {
    development: ['http://localhost:5173', 'http://localhost:3001'],
    production: ['https://onthego.rw'] // Add your production domain
  },
  
  // WebSocket Configuration
  WS_PORT: process.env.WS_PORT || 5001,
  
  // File Upload Configuration
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // System Configuration
  SUPERADMIN_INITIAL_PASSWORD: process.env.SUPERADMIN_INITIAL_PASSWORD || 'OnTheGo@2026!',
  
  // Role Hierarchy
  ROLES: {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin', 
    MANAGER: 'manager',
    WORKER: 'worker',
    DRIVER: 'driver'
  },
  
  // Role Hierarchy Levels (for permission checks)
  ROLE_LEVELS: {
    superadmin: 100,
    admin: 80,
    manager: 60,
    worker: 40,
    driver: 20
  },
  
  // Bus Status
  BUS_STATUS: {
    ACTIVE: 'active',
    MAINTENANCE: 'maintenance', 
    RETIRED: 'retired',
    IDLE: 'idle'
  },
  
  // Trip Status
  TRIP_STATUS: {
    SCHEDULED: 'scheduled',
    BOARDING: 'boarding',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DELAYED: 'delayed'
  },
  
  // Payment Methods
  PAYMENT_METHODS: {
    MTN_MOMO: 'mtn_momo',
    AIRTEL_MONEY: 'airtel_money',
    CASH: 'cash',
    CARD: 'card'
  },
  
  // Incident Types
  INCIDENT_TYPES: {
    ACCIDENT: 'accident',
    BREAKDOWN: 'breakdown',
    COMPLAINT: 'complaint',
    THEFT: 'theft',
    MEDICAL: 'medical',
    DELAY: 'delay',
    OTHER: 'other'
  },
  
  // Incident Severity
  INCIDENT_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  
  // Company Status
  COMPANY_STATUS: {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    PENDING_APPROVAL: 'pending_approval'
  },
  
  // Subscription Tiers
  SUBSCRIPTION_TIERS: {
    BASIC: 'basic',
    STANDARD: 'standard',
    PREMIUM: 'premium'
  },
  
  // Logging Configuration
  LOG_LEVELS: {
    ERROR: 'ERROR',
    WARN: 'WARN', 
    INFO: 'INFO',
    DEBUG: 'DEBUG'
  },
  
  // Currency Configuration
  CURRENCY: {
    CODE: 'RWF',
    SYMBOL: 'RWF',
    DECIMAL_PLACES: 0
  },
  
  // Validation Patterns
  VALIDATION: {
    RWANDA_PHONE: /^(\+250|0)?7[238]\d{7}$/,
    RWANDA_PLATE: /^RAB\s\d{3}\s[A-Z]$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  },
  
  // API Response Messages
  MESSAGES: {
    AUTH_REQUIRED: 'Authentication required',
    AUTH_INVALID: 'Invalid credentials',
    AUTH_EXPIRED: 'Token expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
    RESOURCE_NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    SERVER_ERROR: 'Internal server error',
    COMPANY_SUSPENDED: 'Company account suspended',
    LICENSE_EXPIRED: 'License has expired',
    MAINTENANCE_MODE: 'System under maintenance'
  },
  
  // WebSocket Events
  WS_EVENTS: {
    // Server → Client
    TRIP_LOCATION_UPDATE: 'trip:location_update',
    TRIP_STATUS_CHANGE: 'trip:status_change',
    CONTENT_UPDATED: 'content:updated',
    ANNOUNCEMENT_NEW: 'announcement:new',
    INCIDENT_FILED: 'incident:filed',
    BUS_STATUS_CHANGE: 'bus:status_change',
    DRIVER_STATUS_CHANGE: 'driver:status_change',
    SYSTEM_ALERT: 'system:alert',
    
    // Client → Server
    DRIVER_LOCATION_PING: 'driver:location_ping',
    WORKER_BOARDING_UPDATE: 'worker:boarding_update'
  },
  
  // File Paths
  PATHS: {
    COMPANIES: path.join(__dirname, 'data', 'companies.json'),
    BUSES: path.join(__dirname, 'data', 'buses.json'),
    ROUTES: path.join(__dirname, 'data', 'routes.json'),
    TRIPS: path.join(__dirname, 'data', 'trips.json'),
    DRIVERS: path.join(__dirname, 'data', 'drivers.json'),
    WORKERS: path.join(__dirname, 'data', 'workers.json'),
    MANAGERS: path.join(__dirname, 'data', 'managers.json'),
    PORTAL_USERS: path.join(__dirname, 'data', 'portal_users.json'),
    BOOKINGS: path.join(__dirname, 'data', 'bookings.json'),
    PAYMENTS: path.join(__dirname, 'data', 'payments.json'),
    INCIDENTS: path.join(__dirname, 'data', 'incidents.json'),
    MAINTENANCE: path.join(__dirname, 'data', 'maintenance.json'),
    ANNOUNCEMENTS: path.join(__dirname, 'data', 'announcements.json'),
    PROMOTIONS: path.join(__dirname, 'data', 'promotions.json'),
    CONTENT: path.join(__dirname, 'data', 'content.json'),
    ANALYTICS_SNAPSHOTS: path.join(__dirname, 'data', 'analytics_snapshots.json'),
    AUDIT_LOG: path.join(__dirname, 'data', 'audit_log.json'),
    SETTINGS: path.join(__dirname, 'data', 'settings.json'),
    PRICING_PLANS: path.join(__dirname, 'data', 'pricing_plans.json')
  },
  
  // Collection key mappings
  COLLECTION_KEYS: {
    PRICING_PLANS: 'PRICING_PLANS'
  }
};
