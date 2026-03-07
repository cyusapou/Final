<template>
  <div class="booking-page">
    <div class="container">
      <!-- Header -->
      <header class="booking-header">
        <h1><i class="fas fa-bus"></i> On The Go - Book Your Journey</h1>
        <p>Book your bus tickets across Rwanda with real-time pricing and availability</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading routes and pricing...</p>
      </div>

      <!-- Error Banner (persistent, non-modal) -->
      <div v-if="loadError" class="error-banner">
        <span class="error-icon"><i class="fas fa-exclamation-triangle"></i></span>
        <span>{{ loadError }}</span>
        <button @click="retryLoad" class="btn-retry">Retry</button>
      </div>

      <!-- Booking Form -->
      <div v-else-if="!loading" class="booking-content">
        <!-- Progress Indicator -->
        <div class="booking-progress">
          <div class="progress-step" :class="{ active: true, completed: selectedRoute }">
            <span class="step-number">1</span>
            <span class="step-label">Route</span>
          </div>
          <div class="progress-line" :class="{ filled: selectedRoute }"></div>
          <div class="progress-step" :class="{ active: selectedRoute, completed: selectedTrip }">
            <span class="step-number">2</span>
            <span class="step-label">Trip</span>
          </div>
          <div class="progress-line" :class="{ filled: selectedTrip }"></div>
          <div class="progress-step" :class="{ active: selectedTrip, completed: booking.passengerName && booking.passengerEmail }">
            <span class="step-number">3</span>
            <span class="step-label">Details</span>
          </div>
          <div class="progress-line" :class="{ filled: booking.seats.length > 0 }"></div>
          <div class="progress-step" :class="{ active: booking.seats.length > 0 }">
            <span class="step-number">4</span>
            <span class="step-label">Pay</span>
          </div>
        </div>

        <!-- Route Selection -->
        <section class="route-section card">
          <h2><span class="section-icon"><i class="fas fa-map-marker-alt"></i></span> Select Route</h2>
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
                  <span class="duration"><i class="fas fa-clock"></i> ~{{ selectedRoute.estimatedDurationMinutes }} mins</span>
                  <span class="distance"><i class="fas fa-ruler"></i> {{ selectedRoute.distanceKm }} km</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Trip Selection -->
        <section v-if="selectedRoute" class="trip-section card">
          <h2><span class="section-icon"><i class="fas fa-clock"></i></span> Select Trip</h2>
          
          <!-- Loading trips -->
          <div v-if="loadingTrips" class="section-loading">
            <div class="spinner-small"></div>
            <span>Loading available trips...</span>
          </div>

          <div v-else class="trip-grid">
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
                  ({{ trip.status === 'scheduled' ? '<i class="fas fa-check-circle"></i> Available' : trip.status }})
                </option>
              </select>
            </div>

            <div v-if="availableTrips.length === 0" class="no-trips-message">
              <i class="fas fa-frown"></i> No trips available for this route at the moment.
            </div>

            <!-- Trip Info -->
            <div v-if="selectedTrip" class="trip-info">
              <div class="trip-details">
                <div class="trip-times">
                  <div class="time-item">
                    <span class="label"><i class="fas fa-sign-out-alt"></i> Departure:</span>
                    <span class="value">{{ formatDateTime(selectedTrip.departureTime) }}</span>
                  </div>
                  <div class="time-item">
                    <span class="label"><i class="fas fa-flag-checkered"></i> Arrival:</span>
                    <span class="value">{{ formatDateTime(selectedTrip.arrivalTime) }}</span>
                  </div>
                </div>
                <div class="trip-vehicle">
                   <span class="label"><i class="fas fa-bus"></i> Bus:</span>
                  <span class="value">{{ selectedTrip.bus?.plateNumber || 'TBD' }}</span>
                  <span class="capacity">{{ selectedTrip.bus?.capacity || 0 }} seats</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Passenger Details -->
        <section v-if="selectedTrip" class="passenger-section card">
          <h2><span class="section-icon"><i class="fas fa-user"></i></span> Passenger Details</h2>
          <div class="passenger-form">
            <div class="form-row two-col">
              <div class="form-group">
                <label for="passengerName">Full Name: <span class="required">*</span></label>
                <input 
                  id="passengerName" 
                  v-model="booking.passengerName" 
                  type="text" 
                  required
                  class="form-input"
                  :class="{ 'input-error': validationErrors.passengerName }"
                  placeholder="Enter your full name"
                  @blur="validateField('passengerName')"
                />
                <span v-if="validationErrors.passengerName" class="field-error">{{ validationErrors.passengerName }}</span>
              </div>
              <div class="form-group">
                <label for="passengerEmail">Email: <span class="required">*</span></label>
                <input 
                  id="passengerEmail" 
                  v-model="booking.passengerEmail" 
                  type="email" 
                  required
                  class="form-input"
                  :class="{ 'input-error': validationErrors.passengerEmail }"
                  placeholder="your.email@example.com"
                  @blur="validateField('passengerEmail')"
                />
                <span v-if="validationErrors.passengerEmail" class="field-error">{{ validationErrors.passengerEmail }}</span>
              </div>
            </div>

            <div class="form-row two-col">
              <div class="form-group">
                <label for="passengerPhone">Phone: <span class="required">*</span></label>
                <input 
                  id="passengerPhone" 
                  v-model="booking.passengerPhone" 
                  type="tel" 
                  required
                  class="form-input"
                  :class="{ 'input-error': validationErrors.passengerPhone }"
                  placeholder="+250 7XX XXX XXX"
                  @blur="validateField('passengerPhone')"
                />
                <span v-if="validationErrors.passengerPhone" class="field-error">{{ validationErrors.passengerPhone }}</span>
              </div>
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
        <section v-if="selectedTrip" class="seat-section card">
          <h2><span class="section-icon"><i class="fas fa-chair"></i></span> Select Seats</h2>
          
          <!-- Loading seats -->
          <div v-if="loadingSeats" class="section-loading">
            <div class="spinner-small"></div>
            <span>Loading seat availability...</span>
          </div>

          <div v-else class="seat-selection">
            <p class="seat-instruction">Tap to select your preferred seat(s). Selected: <strong>{{ booking.seats.length }}</strong></p>
            <div class="seat-grid">
              <div 
                v-for="seat in allSeats" 
                :key="seat" 
                class="seat"
                :class="{
                  'selected': booking.seats.includes(seat),
                  'occupied': !availableSeats.includes(seat)
                }"
                @click="toggleSeat(seat)"
                :title="availableSeats.includes(seat) ? 'Seat ' + seat + ' - Available' : 'Seat ' + seat + ' - Occupied'"
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
        <section v-if="booking.seats.length > 0" class="price-section card">
          <h2><span class="section-icon"><i class="fas fa-money-bill-wave"></i></span> Price Summary</h2>
          <div class="price-summary">
            <div class="price-item">
              <span class="label">Base Fare:</span>
              <span class="value">{{ formatCurrency(selectedRoute.fare) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Passenger Type:</span>
              <span class="value discount-badge">
                {{ booking.passengerType.charAt(0).toUpperCase() + booking.passengerType.slice(1) }}
                <span v-if="booking.passengerType !== 'adult'" class="discount-tag">
                  {{ getDiscountLabel(booking.passengerType) }}
                </span>
              </span>
            </div>
            <div class="price-item">
              <span class="label">Per Seat:</span>
              <span class="value">{{ formatCurrency(perSeatFare) }}</span>
            </div>
            <div class="price-item">
              <span class="label">Seats ({{ booking.seats.join(', ') }}):</span>
              <span class="value">× {{ booking.seats.length }}</span>
            </div>
            <div class="price-item total">
              <span class="label">Total Fare:</span>
              <span class="value">{{ formatCurrency(calculatedTotal) }}</span>
            </div>
          </div>
        </section>

        <!-- Payment Method -->
        <section v-if="booking.seats.length > 0" class="payment-section card">
          <h2><span class="section-icon"><i class="fas fa-credit-card"></i></span> Payment Method</h2>
          <div class="payment-options">
            <label class="payment-option" :class="{ 'payment-selected': booking.paymentMethod === 'cash' }">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="cash" 
                class="payment-radio"
              />
              <div class="payment-option-content">
                <span class="payment-icon-emoji"><i class="fas fa-money-bill-alt"></i></span>
                <div class="payment-text">
                  <span class="payment-name">Cash</span>
                  <span class="payment-desc">Pay at station</span>
                </div>
              </div>
            </label>
            <label class="payment-option" :class="{ 'payment-selected': booking.paymentMethod === 'mtn_momo' }">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="mtn_momo" 
                class="payment-radio"
              />
              <div class="payment-option-content">
                <span class="payment-icon-emoji"><i class="fas fa-mobile-alt"></i></span>
                <div class="payment-text">
                  <span class="payment-name">MTN MoMo</span>
                  <span class="payment-desc">Mobile Money</span>
                </div>
              </div>
            </label>
            <label class="payment-option" :class="{ 'payment-selected': booking.paymentMethod === 'airtel_money' }">
              <input 
                type="radio" 
                v-model="booking.paymentMethod" 
                value="airtel_money" 
                class="payment-radio"
              />
              <div class="payment-option-content">
                <span class="payment-icon-emoji"><i class="fas fa-mobile-alt"></i></span>
                <div class="payment-text">
                  <span class="payment-name">Airtel Money</span>
                  <span class="payment-desc">Mobile Money</span>
                </div>
              </div>
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
              <i class="fas fa-trash-alt"></i> Clear Selection
            </button>
            <button 
              @click="confirmBooking" 
              :disabled="!canBook || bookingInProgress"
              class="btn btn-primary"
            >
              <span v-if="!bookingInProgress"><i class="fas fa-check"></i> Confirm Booking</span>
              <span v-else class="btn-loading">
                <span class="spinner-btn"></span> Processing...
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Success Modal -->
    <Teleport to="body">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
        <div class="modal-content success-modal">
          <div class="modal-header">
            <h2><i class="fas fa-check-circle"></i> Booking Confirmed!</h2>
            <button @click="showSuccessModal = false" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="booking-confirmation">
              <div class="booking-ref">
                <span class="ref-label">Booking Reference</span>
                <span class="ref-value">{{ confirmedBooking?.bookingReference }}</span>
              </div>
              <div class="confirmation-details">
                <div class="detail-row">
                  <span class="detail-label">Route:</span>
                  <span class="detail-value">{{ selectedRoute?.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Departure:</span>
                  <span class="detail-value">{{ formatDateTime(selectedTrip?.departureTime) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Seats:</span>
                  <span class="detail-value">{{ confirmedBooking?.seats?.join(', ') }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Paid:</span>
                  <span class="detail-value total-paid">{{ formatCurrency(confirmedBooking?.totalFare) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value status-badge">{{ confirmedBooking?.status }}</span>
                </div>
              </div>
              <div class="confirmation-actions">
                <button @click="handleNewBooking" class="btn btn-primary">
                  <i class="fas fa-bus"></i> Make Another Booking
                </button>
                <button @click="viewRecentBookings" class="btn btn-secondary">
                  <i class="fas fa-clipboard-list"></i> View My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Error Modal -->
    <Teleport to="body">
      <div v-if="errorMessage" class="modal-overlay" @click.self="errorMessage = null">
        <div class="modal-content error-modal">
          <div class="modal-header">
            <h2><i class="fas fa-exclamation-circle"></i> Error</h2>
            <button @click="errorMessage = null" class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <p class="error-text">{{ errorMessage }}</p>
            <button @click="errorMessage = null" class="btn btn-primary">
              OK
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BookingService from '@/services/bookingService';

export default {
  name: 'BookingPage',
  setup() {
    const router = useRouter();

    // Reactive state
    const loading = ref(true);
    const loadingTrips = ref(false);
    const loadingSeats = ref(false);
    const loadError = ref(null);
    const routes = ref([]);
    const trips = ref([]);
    const selectedRouteId = ref('');
    const selectedTripId = ref('');
    const availableSeats = ref([]);
    const allSeats = ref([]);
    const showSuccessModal = ref(false);
    const confirmedBooking = ref(null);
    const errorMessage = ref(null);
    const bookingInProgress = ref(false);

    // Validation errors
    const validationErrors = reactive({
      passengerName: '',
      passengerEmail: '',
      passengerPhone: ''
    });

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
      selectedRoute.value 
        ? trips.value.filter(t => t.routeId === selectedRouteId.value && t.status !== 'cancelled') 
        : []
    );

    const perSeatFare = computed(() => {
      if (!selectedRoute.value) return 0;
      return BookingService.calculateFare(selectedRoute.value.fare, booking.passengerType);
    });

    const calculatedTotal = computed(() => {
      if (!selectedRoute.value || booking.seats.length === 0) return 0;
      return perSeatFare.value * booking.seats.length;
    });

    const canBook = computed(() => {
      return booking.passengerName.trim() && 
             booking.passengerEmail.trim() && 
             booking.passengerPhone.trim() && 
             isValidEmail(booking.passengerEmail) &&
             isValidPhone(booking.passengerPhone) &&
             booking.seats.length > 0 &&
             selectedRoute.value &&
             selectedTrip.value;
    });

    // Validation helpers
    const isValidEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const isValidPhone = (phone) => {
      // Rwanda phone: +250 7XX XXX XXX or 07XX XXX XXX
      return /^(\+?250|0)?7\d{8}$/.test(phone.replace(/\s/g, ''));
    };

    const validateField = (field) => {
      switch (field) {
        case 'passengerName':
          validationErrors.passengerName = booking.passengerName.trim() 
            ? '' 
            : 'Full name is required';
          break;
        case 'passengerEmail':
          if (!booking.passengerEmail.trim()) {
            validationErrors.passengerEmail = 'Email is required';
          } else if (!isValidEmail(booking.passengerEmail)) {
            validationErrors.passengerEmail = 'Please enter a valid email address';
          } else {
            validationErrors.passengerEmail = '';
          }
          break;
        case 'passengerPhone':
          if (!booking.passengerPhone.trim()) {
            validationErrors.passengerPhone = 'Phone number is required';
          } else if (!isValidPhone(booking.passengerPhone)) {
            validationErrors.passengerPhone = 'Enter a valid Rwandan phone number (+250 7XX XXX XXX)';
          } else {
            validationErrors.passengerPhone = '';
          }
          break;
      }
    };

    const getDiscountLabel = (type) => {
      const labels = {
        child: '-50%',
        student: '-20%',
        elderly: '-30%'
      };
      return labels[type] || '';
    };

    // Methods
    const loadRoutes = async () => {
      loading.value = true;
      loadError.value = null;
      try {
        const [routesData, tripsData] = await Promise.all([
          BookingService.getRoutes(),
          BookingService.getTrips()
        ]);
        
        if (!routesData || routesData.length === 0) {
          loadError.value = 'No routes available. The server may be offline.';
        }
        
        routes.value = routesData || [];
        trips.value = tripsData || [];
      } catch (error) {
        loadError.value = 'Failed to load routes and trips. Please check your connection and try again.';
        console.error('Load error:', error);
      } finally {
        loading.value = false;
      }
    };

    const retryLoad = () => {
      loadError.value = null;
      loadRoutes();
    };

    const onRouteChange = () => {
      selectedTripId.value = '';
      booking.seats = [];
      availableSeats.value = [];
      allSeats.value = [];
    };

    const onTripChange = async () => {
      booking.seats = [];
      if (selectedTripId.value) {
        loadingSeats.value = true;
        try {
          const seats = await BookingService.getAvailableSeats(selectedTripId.value);
          availableSeats.value = seats || [];
          // Generate all seats (1 to bus capacity or max available seat number)
          const maxSeat = selectedTrip.value?.bus?.capacity || Math.max(...(seats || [0]), 40);
          allSeats.value = Array.from({ length: maxSeat }, (_, i) => i + 1);
        } catch (error) {
          errorMessage.value = 'Failed to load seat availability. Please try again.';
          availableSeats.value = [];
          allSeats.value = [];
        } finally {
          loadingSeats.value = false;
        }
      } else {
        availableSeats.value = [];
        allSeats.value = [];
      }
    };

    const calculateFare = () => {
      // Fare is calculated via computed property
    };

    const toggleSeat = (seat) => {
      if (!availableSeats.value.includes(seat)) return; // Can't select occupied seats
      const index = booking.seats.indexOf(seat);
      if (index > -1) {
        booking.seats.splice(index, 1);
      } else {
        if (booking.seats.length >= 5) {
          errorMessage.value = 'You can select a maximum of 5 seats per booking.';
          return;
        }
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
      allSeats.value = [];
      // Clear validation errors
      validationErrors.passengerName = '';
      validationErrors.passengerEmail = '';
      validationErrors.passengerPhone = '';
    };

    const confirmBooking = async () => {
      if (!canBook.value) {
        // Validate all fields to show errors
        validateField('passengerName');
        validateField('passengerEmail');
        validateField('passengerPhone');
        return;
      }

      bookingInProgress.value = true;
      
      try {
        const bookingData = {
          tripId: selectedTripId.value,
          passengerName: booking.passengerName.trim(),
          passengerEmail: booking.passengerEmail.trim(),
          passengerPhone: booking.passengerPhone.trim(),
          passengerType: booking.passengerType,
          seats: [...booking.seats].sort((a, b) => a - b),
          paymentMethod: booking.paymentMethod
        };

        const result = await BookingService.createBooking(bookingData);
        
        if (result.success) {
          confirmedBooking.value = result.data;
          showSuccessModal.value = true;
        } else {
          errorMessage.value = result.message || 'Booking failed. Please try again.';
        }
      } catch (error) {
        errorMessage.value = 'Booking failed. Please check your connection and try again.';
        console.error('Booking error:', error);
      } finally {
        bookingInProgress.value = false;
      }
    };

    const handleNewBooking = () => {
      showSuccessModal.value = false;
      resetBooking();
    };

    const viewRecentBookings = () => {
      showSuccessModal.value = false;
      if (router) {
        router.push('/recent-bookings');
      }
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
      loadingTrips,
      loadingSeats,
      loadError,
      routes,
      selectedRouteId,
      selectedTripId,
      selectedRoute,
      selectedTrip,
      availableTrips,
      availableSeats,
      allSeats,
      booking,
      perSeatFare,
      calculatedTotal,
      canBook,
      showSuccessModal,
      confirmedBooking,
      errorMessage,
      bookingInProgress,
      validationErrors,
      onRouteChange,
      onTripChange,
      toggleSeat,
      resetBooking,
      confirmBooking,
      handleNewBooking,
      viewRecentBookings,
      retryLoad,
      validateField,
      getDiscountLabel,
      formatCurrency,
      formatDateTime
    };
  }
};
</script>

<style scoped>
/* ============================================
   BASE STYLES - Mobile First (< 768px)
   ============================================ */
.booking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12px;
}

html.dark .booking-page {
  background: linear-gradient(135deg, #141414 0%, #0a0a0a 100%);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

html.dark .container {
  background: var(--bg-primary);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

/* Header */
.booking-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px 20px;
  text-align: center;
}

html.dark .booking-header {
  background: linear-gradient(135deg, #141414 0%, #0a0a0a 100%);
}

.booking-header h1 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.booking-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* Loading */
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

.spinner-small {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.spinner-btn {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.section-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #666;
  font-size: 0.9rem;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: #fff3f3;
  border-left: 4px solid #e74c3c;
  margin: 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #c0392b;
}

.error-banner .error-icon {
  font-size: 1.2rem;
}

.btn-retry {
  margin-left: auto;
  padding: 6px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
}

.btn-retry:hover {
  background: #c0392b;
}

/* Progress Indicator */
.booking-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  gap: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  opacity: 0.4;
  transition: all 0.3s;
}

.progress-step.active {
  opacity: 1;
}

.progress-step.completed .step-number {
  background: #667eea;
  color: white;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e1e5e1;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.step-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.progress-line {
  width: 30px;
  height: 2px;
  background: #e1e5e1;
  margin: 0 4px;
  margin-bottom: 18px;
  transition: background 0.3s;
}

.progress-line.filled {
  background: #667eea;
}

/* Content */
.booking-content {
  padding: 0 16px 24px;
}

/* Card sections */
.card {
  background: #fafbfc;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

html.dark .card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.card h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

html.dark .card h2 {
  color: var(--text, rgba(255,255,255,0.85));
}

.section-icon {
  font-size: 1.2rem;
}

/* Route Select */
.route-select, .trip-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  color: #333;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

html.dark .route-select, html.dark .trip-select {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-color);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
}

.route-select:focus, .trip-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* Route Info */
.route-info {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #eef0f2;
}

.route-details h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1rem;
}

.route-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.zone-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.duration, .distance {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #555;
}

/* No trips message */
.no-trips-message {
  text-align: center;
  padding: 20px;
  color: #888;
  font-size: 0.95rem;
}

/* Trip Info */
.trip-info {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
  border: 1px solid #eef0f2;
}

.trip-times {
  margin-bottom: 12px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
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
  padding: 10px 12px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 0.85rem;
}

.capacity {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* Form */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 0.85rem;
}

.required {
  color: #e74c3c;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  background: white;
  color: #333;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.input-error {
  border-color: #e74c3c;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.field-error {
  display: block;
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: 500;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Seat Selection */
.seat-instruction {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 12px;
}

.seat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 6px;
  margin-bottom: 15px;
}

.seat {
  width: 100%;
  aspect-ratio: 1;
  max-width: 50px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;
  background: white;
  color: #333;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.seat:active:not(.occupied) {
  transform: scale(0.92);
}

.seat.selected {
  background: #667eea;
  color: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.seat.occupied {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #e1e5e1;
}

.seat-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
}

.legend-item::before {
  content: '';
  width: 16px;
  height: 16px;
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

/* Price Summary */
.price-summary {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eef0f2;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.price-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.price-item .label {
  color: #666;
}

.price-item .value {
  font-weight: 600;
  color: #333;
}

.price-item.total {
  font-weight: 700;
  font-size: 1.15rem;
  color: #667eea;
  padding-top: 10px;
  border-top: 2px solid #667eea;
  margin-top: 4px;
}

.price-item.total .label,
.price-item.total .value {
  color: #667eea;
}

.discount-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.discount-tag {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
}

/* Payment Options */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 14px;
  border: 2px solid #e1e5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  -webkit-tap-highlight-color: transparent;
}

.payment-option:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.payment-option.payment-selected {
  border-color: #667eea;
  background: #f0f2ff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.payment-radio {
  display: none;
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.payment-icon-emoji {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2ff;
  border-radius: 8px;
  flex-shrink: 0;
}

.payment-text {
  display: flex;
  flex-direction: column;
}

.payment-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.payment-desc {
  font-size: 0.75rem;
  color: #888;
}

/* Action Buttons */
.action-section {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ============================================
   MODAL STYLES
   ============================================ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #eef0f2;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 20px;
}

/* Success Modal */
.booking-ref {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  margin-bottom: 20px;
}

.ref-label {
  display: block;
  color: rgba(255,255,255,0.8);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.ref-value {
  display: block;
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.confirmation-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

.total-paid {
  color: #667eea;
  font-size: 1rem;
}

.status-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Error Modal */
.error-modal {
  border-top: 4px solid #e74c3c;
}

.error-modal .modal-header h2 {
  color: #e74c3c;
}

.error-text {
  color: #555;
  line-height: 1.6;
  margin-bottom: 16px;
}

/* ============================================
   TABLET (768px - 1024px)
   ============================================ */
@media (min-width: 768px) {
  .booking-page {
    padding: 24px;
  }

  .booking-header {
    padding: 36px 30px;
  }

  .booking-header h1 {
    font-size: 1.8rem;
  }

  .booking-header p {
    font-size: 1rem;
  }

  .booking-content {
    padding: 0 28px 32px;
  }

  /* Progress */
  .progress-line {
    width: 50px;
  }

  .step-number {
    width: 34px;
    height: 34px;
    font-size: 0.85rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  /* Two-column form rows */
  .form-row.two-col {
    flex-direction: row;
    gap: 16px;
  }

  .form-row.two-col .form-group {
    flex: 1;
  }

  /* Payment options in a row */
  .payment-options {
    flex-direction: row;
  }

  .payment-option {
    flex: 1;
    flex-direction: column;
    text-align: center;
    padding: 18px 12px;
  }

  .payment-option-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .payment-text {
    align-items: center;
  }

  /* Action buttons in a row */
  .action-buttons {
    flex-direction: row;
    justify-content: center;
  }

  .action-buttons .btn {
    min-width: 200px;
  }

  /* Confirmation actions in a row */
  .confirmation-actions {
    flex-direction: row;
  }

  .confirmation-actions .btn {
    flex: 1;
  }

  /* Seat grid larger */
  .seat-grid {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
    gap: 8px;
  }

  .seat {
    max-width: 52px;
    font-size: 0.85rem;
  }

  /* Hover effects for non-touch */
  .seat:hover:not(.occupied) {
    border-color: #667eea;
    transform: scale(1.08);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }
}

/* ============================================
   DESKTOP (> 1024px)
   ============================================ */
@media (min-width: 1024px) {
  .booking-page {
    padding: 32px;
  }

  .container {
    max-width: 960px;
  }

  .booking-header {
    padding: 40px;
  }

  .booking-header h1 {
    font-size: 2rem;
  }

  .booking-header p {
    font-size: 1.1rem;
  }

  .booking-content {
    padding: 0 36px 40px;
  }

  /* Progress */
  .progress-line {
    width: 80px;
  }

  .step-number {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  /* Card hover effect */
  .card {
    transition: box-shadow 0.3s, transform 0.2s;
  }

  .card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  /* Section headings */
  .card h2 {
    font-size: 1.2rem;
  }

  /* Seat grid */
  .seat-grid {
    grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
    gap: 10px;
    max-width: 600px;
  }

  .seat {
    max-width: 56px;
    font-size: 0.9rem;
  }

  /* Payment options */
  .payment-option {
    padding: 20px 16px;
  }

  .payment-icon-emoji {
    font-size: 1.8rem;
    width: 48px;
    height: 48px;
  }

  /* Buttons */
  .action-buttons .btn {
    min-width: 220px;
    padding: 16px 32px;
  }
}

/* ============================================
   LARGE DESKTOP (> 1200px)
   ============================================ */
@media (min-width: 1200px) {
  .container {
    max-width: 1040px;
  }

  .booking-content {
    padding: 0 48px 48px;
  }

  /* Two-column layout for route + trip sections */
  .route-section,
  .trip-section {
    padding: 24px;
  }
}

/* ============================================
   SMALL MOBILE (< 360px)
   ============================================ */
@media (max-width: 360px) {
  .booking-page {
    padding: 8px;
  }

  .booking-header h1 {
    font-size: 1.2rem;
  }

  .booking-header p {
    font-size: 0.8rem;
  }

  .booking-content {
    padding: 0 12px 20px;
  }

  .card {
    padding: 14px;
  }

  .seat-grid {
    grid-template-columns: repeat(auto-fill, minmax(38px, 1fr));
    gap: 4px;
  }

  .seat {
    font-size: 0.7rem;
  }

  .progress-line {
    width: 20px;
  }

  .step-label {
    font-size: 0.6rem;
  }
}

/* Additional dark mode overrides */
html.dark .loading p { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .spinner { border-color: var(--border, rgba(255,255,255,0.07)); border-top-color: var(--green, #22c55e); }
html.dark .spinner-small { border-color: var(--border, rgba(255,255,255,0.07)); border-top-color: var(--green, #22c55e); }
html.dark .section-loading { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .form-group label { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .form-input { background: var(--bg, #0a0a0a); color: var(--text, rgba(255,255,255,0.85)); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .form-input:focus { border-color: var(--green, #22c55e); box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }
html.dark .route-info { background: var(--surface, #141414); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .route-details h3 { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .duration, html.dark .distance { background: var(--bg, #0a0a0a); color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .trip-info { background: var(--surface, #141414); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .time-item .label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .time-item .value { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .trip-vehicle { background: var(--bg, #0a0a0a); color: var(--text, rgba(255,255,255,0.85)); }
html.dark .no-trips-message { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .seat-instruction { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .seat { background: var(--surface, #141414); color: var(--text, rgba(255,255,255,0.85)); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .seat.selected { background: var(--green, #22c55e); color: #fff; border-color: var(--green, #22c55e); box-shadow: var(--glow); }
html.dark .seat.occupied { background: var(--bg, #0a0a0a); color: rgba(255,255,255,0.15); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .legend-item { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .legend-item.available::before { background: var(--surface, #141414); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .legend-item.selected::before { background: var(--green, #22c55e); border-color: var(--green, #22c55e); }
html.dark .legend-item.occupied::before { background: var(--bg, #0a0a0a); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .price-summary { background: var(--surface, #141414); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .price-item { border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .price-item .label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .price-item .value { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .price-item.total { border-color: var(--green, #22c55e); color: var(--green, #22c55e); }
html.dark .price-item.total .label,
html.dark .price-item.total .value { color: var(--green, #22c55e); }
html.dark .payment-option { background: var(--surface, #141414); border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .payment-option:hover { border-color: var(--green, #22c55e); background: var(--hover, rgba(255,255,255,0.03)); }
html.dark .payment-option.payment-selected { border-color: var(--green, #22c55e); background: var(--green-muted, rgba(34,197,94,0.08)); }
html.dark .payment-icon-emoji { background: var(--bg, #0a0a0a); }
html.dark .payment-name { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .payment-desc { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .btn-primary { background: var(--green, #22c55e); box-shadow: var(--glow); }
html.dark .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(34,197,94,0.3); }
html.dark .btn-primary:disabled { background: rgba(255,255,255,0.1); }
html.dark .btn-secondary { background: var(--surface, #141414); color: var(--text, rgba(255,255,255,0.85)); }
html.dark .btn-secondary:hover { background: var(--hover, rgba(255,255,255,0.03)); }
html.dark .modal-content { background: var(--surface, #141414); }
html.dark .modal-header { border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .modal-header h2 { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .close-btn { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .close-btn:hover { background: var(--hover, rgba(255,255,255,0.03)); }
html.dark .detail-row { border-color: var(--border, rgba(255,255,255,0.07)); }
html.dark .detail-label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .detail-value { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .total-paid { color: var(--green, #22c55e); }
html.dark .error-text { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .step-number { background: var(--surface, #141414); color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .progress-step.completed .step-number { background: var(--green, #22c55e); color: #fff; }
html.dark .step-label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .progress-line { background: var(--border, rgba(255,255,255,0.07)); }
html.dark .progress-line.filled { background: var(--green, #22c55e); }
html.dark .error-banner { background: rgba(211,47,47,0.1); border-color: #ef4444; color: #f87171; }
html.dark .discount-tag { background: var(--green-muted, rgba(34,197,94,0.08)); color: var(--green, #22c55e); }
html.dark .zone-badge { background: var(--green, #22c55e); }
html.dark .capacity { background: var(--green, #22c55e); }
html.dark .status-badge { background: var(--green-muted, rgba(34,197,94,0.08)); color: var(--green, #22c55e); }
</style>
