/**
 * ============================================================
 * PUBLIC ROUTES
 * ============================================================
 * Public-facing API for the passenger Vue app
 * No authentication required
 */

const express = require('express');
const { 
  getCollection,
  filterCollection,
  insertOne
} = require('../state');
const { 
  validateRequired,
  validateEmail,
  validatePhone,
  validateString
} = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Get all stations
 * Returns the 53 Kigali bus stations with coordinates
 */
router.get('/stations', asyncHandler(async (req, res) => {
  const stations = getCollection('companies'); // Will be replaced with actual stations data
  
  // For now, return the existing stations from frontend data
  // In production, this would come from the database
  res.json({
    success: true,
    data: {
      stations: [
        // This would be populated from the database
        // For now, the frontend uses its own stations data
      ]
    }
  });
}));

/**
 * Get all routes
 * Returns available bus routes with details
 */
router.get('/routes', asyncHandler(async (req, res) => {
  const routes = getCollection('routes');
  
  res.json({
    success: true,
    data: { routes }
  });
}));
/**
 * Get live trips
 * Returns currently active trips with real-time data
 */
router.get('/trips/live', asyncHandler(async (req, res) => {
  const { routeId, stationId } = req.query;
  
  let trips = filterCollection('trips', trip => trip.status === 'in_progress');
  
  // Filter by route if specified
  if (routeId) {
    trips = trips.filter(trip => trip.routeId === routeId);
  }
  
  // Filter by station if specified
  if (stationId) {
    trips = trips.filter(trip => 
      trip.currentStopIndex < trip.route.waypoints.length &&
      trip.route.waypoints[trip.currentStopIndex].stationId === stationId
    );
  }
  
  res.json({
    success: true,
    data: { trips }
  });
}));
/**
 * Get web content
 * Returns content for the passenger app (hero, announcements, etc.)
 */
router.get('/content', asyncHandler(async (req, res) => {
  const content = getCollection('content');
  
  res.json({
    success: true,
    data: { content }
  });
}));

/**
 * Get announcements
 * Returns active announcements
 */
router.get('/announcements', asyncHandler(async (req, res) => {
  const content = getCollection('content');
  const announcements = content.announcements?.filter(ann => 
    ann.status === 'active' && 
    new Date(ann.startDate) <= new Date() && 
    new Date(ann.endDate) >= new Date()
  ) || [];
  
  res.json({
    success: true,
    data: { announcements }
  });
}));

/**
 * Get promotions
 * Returns active promotions
 */
router.get('/promotions', asyncHandler(async (req, res) => {
  const promotions = getCollection('promotions');
  const activePromotions = promotions.filter(prom => 
    prom.status === 'active' && 
    new Date(prom.startDate) <= new Date() && 
    new Date(prom.endDate) >= new Date()
  );
  
  res.json({
    success: true,
    data: { promotions: activePromotions }
  });
}));

/**
 * Get companies
 * Returns all transport companies
 */
router.get('/companies', asyncHandler(async (req, res) => {
  const companies = getCollection('companies');
  
  res.json({
    success: true,
    data: { companies }
  });
}));

/**
 * Submit feedback
 * Allows passengers to submit feedback
 */
router.post('/feedback', asyncHandler(async (req, res) => {
  const { name, email, phone, message, type } = req.body;
  
  validateRequired(req.body, ['name', 'email', 'message']);
  validateEmail(email);
  validatePhone(phone);
  validateString(message, 10, 1000);
  
  const feedback = {
    name,
    email,
    phone: phone || '',
    message,
    type: type || 'general',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  const createdFeedback = await insertOne('feedback', feedback);
  
  res.json({
    success: true,
    data: { feedback: createdFeedback },
    message: 'Feedback submitted successfully'
  });
}));

module.exports = router;
