/**
 * ============================================================
 * BOOKING SERVICE
 * ============================================================
 * Handles all booking-related API calls
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

class BookingService {
  /**
   * Get all pricing plans
   */
  static async getPricingPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/pricing`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      return [];
    }
  }

  /**
   * Get available seats for a trip
   */
  static async getAvailableSeats(tripId) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/seats/${tripId}`);
      const data = await response.json();
      return data.success ? data.data.availableSeats : [];
    } catch (error) {
      console.error('Error fetching available seats:', error);
      return [];
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'BOOKING_ERROR', message: error.message };
    }
  }

  /**
   * Get booking by reference
   */
  static async getBookingByReference(reference) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/reference/${reference}`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  }

  /**
   * Get user's recent bookings
   */
  static async getRecentBookings(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/recent/${email}`);
      const data = await response.json();
      return data.success ? data.data.bookings : [];
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
      return [];
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(reference, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/cancel/${reference}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: 'CANCELLATION_ERROR', message: error.message };
    }
  }

  /**
   * Get all routes
   */
  static async getRoutes() {
    try {
      const response = await fetch(`${API_BASE_URL}/public/routes`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  }

  /**
   * Get all trips
   */
  static async getTrips() {
    try {
      const response = await fetch(`${API_BASE_URL}/public/trips`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
  }

  /**
   * Get all stations
   */
  static async getStations() {
    try {
      const response = await fetch(`${API_BASE_URL}/public/stations`);
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching stations:', error);
      return [];
    }
  }

  /**
   * Calculate fare based on route and passenger type
   */
  static calculateFare(baseFare, passengerType = 'adult') {
    const discounts = {
      adult: 1,
      child: 0.5,
      student: 0.8,
      elderly: 0.7
    };
    
    const discount = discounts[passengerType] || 1;
    return Math.round(baseFare * discount);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  }
}

export default BookingService;
