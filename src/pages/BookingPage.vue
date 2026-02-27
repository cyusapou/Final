<template>
  <div class="booking-page">
    <div class="container">
      <!-- Header -->
      <header class="booking-header">
        <h1>🚌 On The Go - Book Your Journey</h1>
        <p>Book your bus tickets across Rwanda with real-time pricing and availability</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading routes and pricing...</p>
      </div>

      <!-- Booking Form -->
      <div v-else class="booking-content">
        <!-- Route Selection -->
        <section class="route-section">
          <h2>Select Route</h2>
          <div class="route-grid">
            <div class="form-group">
              <label for="routeSelect">From - To Route:</label>
              <select 
                id="routeSelect" 
                v-model="selectedRouteId" 
                @change="onRouteChange"
                class="route-select"
              >
                <option value="">Select a route...</option>
                <option 
                  v-for="route in routes" 
                  :key="route.id" 
                  :value="route.id"
                >
                  {{ route.code }} - {{ route.name }} ({{ formatCurrency(route.fare) }})
                </option>
              </select>
            </div>

            <!-- Route Info -->
            <div v-if="selectedRoute" class="route-info">
              <div class="route-details">
                <h3>{{ selectedRoute.name }}</h3>
                <div class="route-meta">
                  <span class="zone-badge">Zone {{ selectedRoute.zone }}</span>
                  <span class="duration">~{{ selectedRoute.estimatedDurationMinutes }} mins</span>
                  <span class="distance">{{ selectedRoute.distanceKm }} km</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trip Selection -->
        <section v-if="selectedRoute" class="trip-section">
          <h2>Select Trip</h2>
          <div class="trip-grid">
            <div class="form-group">
              <label for="tripSelect">Available Trips:</label>
              <select 
                id="tripSelect" 
                v-model="selectedTripId" 
                @change="onTripChange"
                class="trip-select"
              >
                <option value="">Select a trip...</option>
                <option 
                  v-for="trip in availableTrips" 
                  :key="trip.id" 
                  :value="trip.id"
                >
                  {{ formatDateTime(trip.departureTime) }} - {{ formatDateTime(trip.arrivalTime) }}
                </option>
              </select>
            </div>

            <!-- Trip Info -->
            <div v-if="selectedTrip" class="trip-info">
              <div class="trip-details">
                <div class="trip-times">
                  <div class="time-item">
                    <span class="label">Departure:</span>
                    <span class="value">{{ formatDateTime(selectedTrip.departureTime) }}</span>
                  </div>
                  <div class="time-item">
                    <span class="label">Arrival:</span>
                    <span class="value">{{ formatDateTime(selectedTrip.arrivalTime) }}</span>
                  </div>
                </div>
                <div class="trip-vehicle">
                  <span class="label">Bus:</span>
                  <span class="value">{{ selectedTrip.bus?.plateNumber || 'TBD' }}</span>
                  <span class="capacity">{{ selectedTrip.bus?.capacity || 0 }} seats</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Passenger Details -->
        <section v-if="selectedTrip" class="passenger-section">
          <h2>Passenger Details</h2>
          <div class="passenger-form">
            <div class="form-row">
              <div class="form-group">
                <label for="passengerName">Full Name:</label>
                <input 
                  id="passengerName" 
                  v-model="booking.passengerName" 
                  type="text" 
                  required
                  class="form-input"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="passengerEmail">Email:</label>
                <input 
                  id="passengerEmail" 
                  v-model="booking.passengerEmail" 
                  type="email" 
                  required
                  class="form-input"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="passengerPhone">Phone:</label>
                <input 
                  id="passengerPhone" 
                  v-model="booking.passengerPhone" 
                  type="tel" 
                  required
                  class="form-input"
                  placeholder="+250 7XX XXX XXX"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="passengerType">Passenger Type:</label>
                <select 
                  id="passengerType" 
                  v-model="booking.passengerType" 
                  @change="calculateFare"
                  class="form-input"
                >
                  <option value="adult">Adult (Full Price)</option>
                  <option value="child">Child (50% Discount)</option>
                  <option value="student">Student (20% Discount)</option>
                  <option value="elderly">Elderly (30% Discount)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Seat Selection -->
        <section v-if="selectedTrip" class="seat-section">
          <h2>Select Seats</h2>
          <div class="seat-selection">
            <div class="seat-grid">
              <div 
                v-for="seat in availableSeats" 
                :key="seat" 
                class="seat"
                :class="{
                  'selected': booking.seats.includes(seat),
                  'occupied': !availableSeats.includes(seat)
                }"
                @click="toggleSeat(seat)"
              >
                {{ seat }}
              </div>
            </div>
            
            <div class="seat-legend">
              <span class="legend-item available">Available</span>
              <span class="legend-item selected">Selected</span>
              <span class="legend-item occupied">Occupied</span>
            </div>
          </div>
        </section>

        <!-- Price Summary -->
        <section v-if="booking.seats.length > 0" class="price-section">
          <h2>Price Summary</h2>
          <div class="price-summary">
            <div class="price-item">
              <span class="label">Base Fare:</span>
              <span class="value">{{ formatCurrency(selectedRoute.fare) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Passenger Type:</span>
              <span class="value">{{ booking.passengerType.charAt(0).toUpperCase() + booking.passengerType.slice(1) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Seats:</span>
              <span class="value">{{ booking.seats.length }}</span>
            </div>
            <div class="price-item total">
              <span class="label">Total Fare:</span>
              <span class="value">{{ formatCurrency(calculatedTotal) }}</span>
            </div>
          </div>
        </section>

        <!-- Payment Method -->
        <section v-if="booking.seats.length > 0" class="payment-section">
          <h2>Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="cash" 
                class="payment-radio"
              />
              <span class="payment-label">💵 Cash (Pay at station)</span>
            </label>
            <label class="payment-option">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="mtn_momo" 
                class="payment-radio"
              />
              <span class="payment-label">📱 MTN Mobile Money</span>
            </label>
            <label class="payment-option">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="airtel_money" 
                class="payment-radio"
              />
              <span class="payment-label">📱 Airtel Money</span>
            </label>
          </div>
        </section>

        <!-- Action Buttons -->
        <section v-if="booking.seats.length > 0" class="action-section">
          <div class="action-buttons">
            <button 
              @click="resetBooking" 
              class="btn btn-secondary"
            >
              Clear Selection
            </button>
            <button 
              @click="confirmBooking" 
              :disabled="!canBook || bookingInProgress"
              class="btn btn-primary"
            >
              <span v-if="!bookingInProgress">Confirm Booking</span>
              <span v-else>Processing...</span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>✅ Booking Confirmed!</h2>
          <button @click="showSuccessModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="booking-confirmation">
            <h3>Booking Reference: {{ confirmedBooking?.bookingReference }}</h3>
            <div class="confirmation-details">
              <p><strong>Route:</strong> {{ selectedRoute?.name }}</p>
              <p><strong>Departure:</strong> {{ formatDateTime(selectedTrip?.departureTime) }}</p>
              <p><strong>Seats:</strong> {{ confirmedBooking?.seats?.join(', ') }}</p>
              <p><strong>Total Paid:</strong> {{ formatCurrency(confirmedBooking?.totalFare) }}</p>
              <p><strong>Status:</strong> {{ confirmedBooking?.status }}</p>
            </div>
            <div class="confirmation-actions">
              <button @click="showSuccessModal = false" class="btn btn-primary">
                Make Another Booking
              </button>
              <button @click="viewRecentBookings" class="btn btn-secondary">
                View My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="errorMessage" class="modal error-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>❌ Error</h2>
          <button @click="errorMessage = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
          <button @click="errorMessage = null" class="btn btn-primary">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import BookingService from '@/services/bookingService';

export default {
  name: 'BookingPage',
  setup() {
    // Reactive state
    const loading = ref(true);
    const routes = ref([]);
    const trips = ref([]);
    const selectedRouteId = ref('');
    const selectedTripId = ref('');
    const availableSeats = ref([]);
    const showSuccessModal = ref(false);
    const confirmedBooking = ref(null);
    const errorMessage = ref(null);
    const bookingInProgress = ref(false);

    // Booking form data
    const booking = reactive({
      passengerName: '',
      passengerEmail: '',
      passengerPhone: '',
      passengerType: 'adult',
      seats: [],
      paymentMethod: 'cash'
    });

    // Computed properties
    const selectedRoute = computed(() => 
      routes.value.find(r => r.id === selectedRouteId.value)
    );

    const selectedTrip = computed(() => 
      trips.value.find(t => t.id === selectedTripId.value)
    );

    const availableTrips = computed(() => 
      selectedRoute.value ? trips.value.filter(t => t.routeId === selectedRouteId.value) : []
    );

    const calculatedTotal = computed(() => {
      if (!selectedRoute.value || booking.seats.length === 0) return 0;
      const baseFare = selectedRoute.value.fare;
      const passengerFare = BookingService.calculateFare(baseFare, booking.passengerType);
      return passengerFare * booking.seats.length;
    });

    const canBook = computed(() => {
      return booking.passengerName && 
             booking.passengerEmail && 
             booking.passengerPhone && 
             booking.seats.length > 0 &&
             selectedRoute.value &&
             selectedTrip.value;
    });

    // Methods
    const loadRoutes = async () => {
      try {
        const [routesData, tripsData] = await Promise.all([
          BookingService.getRoutes(),
          BookingService.getTrips()
        ]);
        routes.value = routesData;
        trips.value = tripsData;
      } catch (error) {
        errorMessage.value = 'Failed to load routes and trips';
      } finally {
        loading.value = false;
      }
    };

    const onRouteChange = () => {
      selectedTripId.value = '';
      booking.seats = [];
      calculateFare();
    };

    const onTripChange = async () => {
      if (selectedTripId.value) {
        availableSeats.value = await BookingService.getAvailableSeats(selectedTripId.value);
      }
      booking.seats = [];
    };

    const calculateFare = () => {
      // Fare is calculated via computed property
    };

    const toggleSeat = (seat) => {
      const index = booking.seats.indexOf(seat);
      if (index > -1) {
        booking.seats.splice(index, 1);
      } else if (availableSeats.value.includes(seat)) {
        booking.seats.push(seat);
      }
    };

    const resetBooking = () => {
      booking.passengerName = '';
      booking.passengerEmail = '';
      booking.passengerPhone = '';
      booking.passengerType = 'adult';
      booking.seats = [];
      booking.paymentMethod = 'cash';
      selectedRouteId.value = '';
      selectedTripId.value = '';
      availableSeats.value = [];
    };

    const confirmBooking = async () => {
      if (!canBook.value) return;

      bookingInProgress.value = true;
      
      try {
        const bookingData = {
          tripId: selectedTripId.value,
          passengerName: booking.passengerName,
          passengerEmail: booking.passengerEmail,
          passengerPhone: booking.passengerPhone,
          passengerType: booking.passengerType,
          seats: booking.seats,
          paymentMethod: booking.paymentMethod
        };

        const result = await BookingService.createBooking(bookingData);
        
        if (result.success) {
          confirmedBooking.value = result.data;
          showSuccessModal.value = true;
          resetBooking();
        } else {
          errorMessage.value = result.message || 'Booking failed';
        }
      } catch (error) {
        errorMessage.value = 'Booking failed. Please try again.';
      } finally {
        bookingInProgress.value = false;
      }
    };

    const viewRecentBookings = () => {
      // Navigate to recent bookings page
      showSuccessModal.value = false;
      // In a real app, you'd use Vue Router
      console.log('Navigate to recent bookings');
    };

    const formatCurrency = (amount) => {
      return BookingService.formatCurrency(amount);
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('en-RW', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Lifecycle
    onMounted(() => {
      loadRoutes();
    });

    return {
      loading,
      routes,
      selectedRouteId,
      selectedTripId,
      selectedRoute,
      selectedTrip,
      availableTrips,
      availableSeats,
      booking,
      calculatedTotal,
      canBook,
      showSuccessModal,
      confirmedBooking,
      errorMessage,
      bookingInProgress,
      onRouteChange,
      onTripChange,
      toggleSeat,
      resetBooking,
      confirmBooking,
      viewRecentBookings,
      formatCurrency,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.booking-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  margin: -20px -20px 30px -20px;
}

.booking-header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 700;
}

.booking-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.booking-content {
  padding: 30px;
}

.route-section, .trip-section, .passenger-section, .seat-section, .price-section, .payment-section, .action-section {
  margin-bottom: 30px;
}

.route-section h2, .trip-section h2, .passenger-section h2, .seat-section h2, .price-section h2, .payment-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

.route-select, .trip-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.route-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 15px;
}

.route-details h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.route-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.zone-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.duration, .distance {
  background: #e1e5e1;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.trip-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 15px;
}

.trip-times {
  margin-bottom: 15px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.time-item .label {
  font-weight: 600;
  color: #666;
}

.time-item .value {
  color: #333;
  font-weight: 500;
}

.trip-vehicle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #e1e5e1;
  border-radius: 6px;
}

.capacity {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

.seat {
  width: 50px;
  height: 50px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.seat:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.seat.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.seat.occupied {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #e1e5e1;
}

.seat-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-item::before {
  content: '';
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid;
}

.legend-item.available::before {
  background: white;
  border-color: #e1e5e1;
}

.legend-item.selected::before {
  background: #667eea;
  border-color: #667eea;
}

.legend-item.occupied::before {
  background: #f5f5f5;
  border-color: #e1e5e1;
}

.price-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e1e5e1;
}

.price-item:last-child {
  border-bottom: none;
}

.price-item.total {
  font-weight: 700;
  font-size: 1.2rem;
  color: #667eea;
  padding-top: 10px;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.payment-radio {
  margin-right: 10px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #e1e5e1;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  border-bottom: 1px solid #e1e5e1;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.booking-confirmation h3 {
  color: #667eea;
  margin: 0 0 20px 0;
}

.confirmation-details p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.confirmation-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.error-modal .modal-content {
  border: 2px solid #e74c3c;
}

.error-modal .modal-header h2 {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    border-radius: 8px;
  }
  
  .booking-header {
    padding: 20px;
    margin: -10px -10px 20px -10px;
  }
  
  .booking-content {
    padding: 20px;
  }
  
  .route-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .payment-options {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
