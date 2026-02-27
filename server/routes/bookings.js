/**
 * ============================================================
 * BOOKING ROUTES
 * ============================================================
 * Bus booking management with fare calculation and seat management
 */

const express = require('express');
const { 
  insertOne,
  updateOne,
  findById,
  findWhere,
  bulkInsert
} = require('../db/fileStore');
const { 
  getCollection,
  addAuditLog
} = require('../state');
const { 
  validateRequired,
  validateEmail,
  validatePhone
} = require('../middleware/validator');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Calculate fare based on route and pricing plans
 */
const calculateFare = (routeId, passengerType = 'adult') => {
  const pricingPlans = getCollection('pricingPlans');
  const routes = getCollection('routes');
  
  const route = routes.find(r => r.id === routeId);
  if (!route) {
    throw new Error('Route not found');
  }
  
  const pricing = pricingPlans.find(p => p.routeId === routeId);
  if (!pricing) {
    throw new Error('Pricing not available for this route');
  }
  
  let baseFare = pricing.fare;
  
  // Apply passenger type discounts
  switch (passengerType) {
    case 'child':
      baseFare *= 0.5; // 50% discount for children
      break;
    case 'student':
      baseFare *= 0.8; // 20% discount for students
      break;
    case 'elderly':
      baseFare *= 0.7; // 30% discount for elderly
      break;
  }
  
  return Math.round(baseFare);
};

/**
 * Get available seats for a trip
 */
const getAvailableSeats = (tripId) => {
  const trips = getCollection('trips');
  const bookings = getCollection('bookings');
  
  const trip = trips.find(t => t.id === tripId);
  if (!trip) {
    throw new Error('Trip not found');
  }
  
  const bookedSeats = bookings
    .filter(b => b.tripId === tripId && b.status !== 'cancelled')
    .flatMap(b => b.seats);
  
  const allSeats = Array.from({ length: trip.bus.capacity }, (_, i) => i + 1);
  const availableSeats = allSeats.filter(seat => !bookedSeats.includes(seat));
  
  return availableSeats;
};

/**
 * Get all pricing plans
 */
router.get('/pricing', asyncHandler(async (req, res) => {
  const pricingPlans = getCollection('pricingPlans');
  const routes = getCollection('routes');
  
  const pricingWithRoutes = pricingPlans.map(pricing => {
    const route = routes.find(r => r.id === pricing.routeId);
    return {
      ...pricing,
      routeName: route ? route.name : 'Unknown Route',
      routeCode: route ? route.code : 'N/A'
    };
  });
  
  res.json({
    success: true,
    data: pricingWithRoutes
  });
}));

/**
 * Get available seats for a specific trip
 */
router.get('/seats/:tripId', asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  
  try {
    const availableSeats = getAvailableSeats(tripId);
    
    res.json({
      success: true,
      data: { availableSeats }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'SEAT_ERROR',
      message: error.message
    });
  }
}));

/**
 * Create a new booking
 */
router.post('/', asyncHandler(async (req, res) => {
  const {
    tripId,
    passengerName,
    passengerEmail,
    passengerPhone,
    passengerType = 'adult',
    seats,
    paymentMethod = 'cash'
  } = req.body;
  
  // Validate required fields
  validateRequired(req.body, ['tripId', 'passengerName', 'passengerEmail', 'passengerPhone', 'seats']);
  validateEmail(passengerEmail);
  validatePhone(passengerPhone);
  
  // Validate seats
  if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'At least one seat must be selected'
    });
  }
  
  try {
    // Check if seats are still available
    const availableSeats = getAvailableSeats(tripId);
    const requestedSeats = seats.map(s => parseInt(s));
    const unavailableSeats = requestedSeats.filter(seat => !availableSeats.includes(seat));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'SEATS_UNAVAILABLE',
        message: `Seats ${unavailableSeats.join(', ')} are no longer available`,
        data: { unavailableSeats, availableSeats }
      });
    }
    
    // Calculate fare
    const fare = calculateFare(tripId, passengerType);
    const totalFare = fare * seats.length;
    
    // Create booking
    const booking = {
      bookingReference: `BK${Date.now()}${Math.floor(Math.random() * 1000)}`,
      tripId,
      passengerName,
      passengerEmail,
      passengerPhone,
      passengerType,
      seats: requestedSeats,
      fare,
      totalFare,
      paymentMethod,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      bookedAt: new Date().toISOString()
    };
    
    const createdBooking = await insertOne('bookings', booking);
    
    // Log audit
    addAuditLog({
      action: 'CREATE_BOOKING',
      entityType: 'booking',
      entityId: createdBooking.id,
      details: {
        bookingReference: createdBooking.bookingReference,
        tripId,
        passengerName,
        totalFare
      }
    });
    
    res.status(201).json({
      success: true,
      data: { booking: createdBooking },
      message: 'Booking confirmed successfully'
    });
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'BOOKING_ERROR',
      message: error.message
    });
  }
}));

/**
 * Get booking by reference
 */
router.get('/reference/:reference', asyncHandler(async (req, res) => {
  const { reference } = req.params;
  
  const bookings = getCollection('bookings');
  const booking = bookings.find(b => b.bookingReference === reference);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'BOOKING_NOT_FOUND',
      message: 'Booking not found'
    });
  }
  
  // Get trip details
  const trips = getCollection('trips');
  const routes = getCollection('routes');
  const companies = getCollection('companies');
  
  const trip = trips.find(t => t.id === booking.tripId);
  const route = trip ? routes.find(r => r.id === trip.routeId) : null;
  const company = trip ? companies.find(c => c.id === trip.companyId) : null;
  
  res.json({
    success: true,
    data: {
      booking,
      trip: trip ? {
        ...trip,
        route: route ? {
          ...route,
          company: company ? {
            id: company.id,
            name: company.name,
            logo: company.logo
          } : null
        } : null
      } : null
    }
  });
}));

/**
 * Get user's recent bookings
 */
router.get('/recent/:email', asyncHandler(async (req, res) => {
  const { email } = req.params;
  
  validateEmail(email);
  
  const bookings = getCollection('bookings');
  const userBookings = bookings
    .filter(b => b.passengerEmail === email)
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
    .slice(0, 10); // Last 10 bookings
  
  // Enrich with trip and route details
  const trips = getCollection('trips');
  const routes = getCollection('routes');
  const companies = getCollection('companies');
  
  const enrichedBookings = userBookings.map(booking => {
    const trip = trips.find(t => t.id === booking.tripId);
    const route = trip ? routes.find(r => r.id === trip.routeId) : null;
    const company = trip ? companies.find(c => c.id === trip.companyId) : null;
    
    return {
      ...booking,
      trip: trip ? {
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        route: route ? {
          name: route.name,
          code: route.code
        } : null,
        company: company ? {
          name: company.name,
          logo: company.logo
        } : null
      } : null
    };
  });
  
  res.json({
    success: true,
    data: { bookings: enrichedBookings }
  });
}));

/**
 * Cancel booking
 */
router.put('/cancel/:reference', asyncHandler(async (req, res) => {
  const { reference } = req.params;
  const { reason } = req.body;
  
  const bookings = getCollection('bookings');
  const booking = bookings.find(b => b.bookingReference === reference);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'BOOKING_NOT_FOUND',
      message: 'Booking not found'
    });
  }
  
  if (booking.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      error: 'ALREADY_CANCELLED',
      message: 'Booking is already cancelled'
    });
  }
  
  // Check if cancellation is allowed (within 1 hour of departure)
  const trips = getCollection('trips');
  const trip = trips.find(t => t.id === booking.tripId);
  
  if (trip) {
    const departureTime = new Date(trip.departureTime);
    const now = new Date();
    const timeDiff = departureTime - now;
    
    if (timeDiff < 60 * 60 * 1000) { // Less than 1 hour
      return res.status(400).json({
        success: false,
        error: 'CANCELLATION_NOT_ALLOWED',
        message: 'Bookings can only be cancelled at least 1 hour before departure'
      });
    }
  }
  
  // Update booking status
  const updatedBooking = await updateOne('bookings', booking.id, {
    status: 'cancelled',
    cancellationReason: reason || 'User requested cancellation',
    cancelledAt: new Date().toISOString()
  });
  
  // Log audit
  addAuditLog({
    action: 'CANCEL_BOOKING',
    entityType: 'booking',
    entityId: booking.id,
    details: {
      bookingReference: reference,
      reason: reason || 'User requested cancellation'
    }
  });
  
  res.json({
    success: true,
    data: { booking: updatedBooking },
    message: 'Booking cancelled successfully'
  });
}));

module.exports = router;
