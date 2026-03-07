<template>
  <div class="recent-bookings-page bg-white dark:bg-neutral-950 transition-colors">
    <div class="container">
      <!-- Header -->
      <header class="page-header">
        <h1><i class="fas fa-clipboard-list"></i> My Recent Bookings</h1>
        <p>View and manage your recent bus bookings</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your bookings...</p>
      </div>

      <!-- Bookings List -->
      <div v-else class="bookings-content">
        <!-- Search/Filter -->
        <section class="search-section">
          <div class="search-controls">
            <div class="form-group">
              <label for="emailSearch">Email:</label>
              <input 
                id="emailSearch" 
                v-model="searchEmail" 
                type="email" 
                placeholder="Enter your email to search bookings"
                class="search-input"
                @input="searchBookings"
              />
            </div>
            <div class="form-group">
              <label for="statusFilter">Status:</label>
              <select 
                id="statusFilter" 
                v-model="statusFilter" 
                @change="filterBookings"
                class="filter-select"
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Bookings Grid -->
        <section v-if="filteredBookings.length > 0" class="bookings-grid">
          <div 
            v-for="booking in filteredBookings" 
            :key="booking.id" 
            class="booking-card"
            :class="getBookingCardClass(booking.status)"
          >
            <!-- Booking Header -->
            <div class="booking-header">
              <div class="booking-reference">
                <span class="label">Reference:</span>
                <span class="value">{{ booking.bookingReference }}</span>
              </div>
              <div class="booking-status">
                <span class="status-badge" :class="booking.status">
                  {{ formatStatus(booking.status) }}
                </span>
              </div>
            </div>

            <!-- Route Information -->
            <div class="booking-route">
              <h3>{{ booking.trip?.route?.name || 'Route Information' }}</h3>
              <div class="route-details">
                <div class="route-item">
                  <span class="label">From:</span>
                  <span class="value">{{ getOriginStation(booking) }}</span>
                </div>
                <div class="route-item">
                  <span class="label">To:</span>
                  <span class="value">{{ getDestinationStation(booking) }}</span>
                </div>
                <div class="route-item">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDateTime(booking.trip?.departureTime) }}</span>
                </div>
              </div>
            </div>

            <!-- Passenger Information -->
            <div class="booking-passenger">
              <h4>Passenger Details</h4>
              <div class="passenger-info">
                <div class="passenger-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ booking.passengerName }}</span>
                </div>
                <div class="passenger-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ booking.passengerEmail }}</span>
                </div>
                <div class="passenger-item">
                  <span class="label">Phone:</span>
                  <span class="value">{{ booking.passengerPhone }}</span>
                </div>
                <div class="passenger-item">
                  <span class="label">Type:</span>
                  <span class="value">{{ formatPassengerType(booking.passengerType) }}</span>
                </div>
              </div>
            </div>

            <!-- Seat Information -->
            <div class="booking-seats">
              <h4>Seat Information</h4>
              <div class="seats-info">
                <div class="seats-item">
                  <span class="label">Seats:</span>
                  <span class="value">{{ booking.seats?.join(', ') || 'N/A' }}</span>
                </div>
                <div class="seats-item">
                  <span class="label">Count:</span>
                  <span class="value">{{ booking.seats?.length || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Price Information -->
            <div class="booking-price">
              <h4>Price Details</h4>
              <div class="price-info">
                <div class="price-item">
                  <span class="label">Base Fare:</span>
                  <span class="value">{{ formatCurrency(booking.fare) }}</span>
                </div>
                <div class="price-item">
                  <span class="label">Passenger Type:</span>
                  <span class="value">{{ formatPassengerType(booking.passengerType) }}</span>
                </div>
                <div class="price-item total">
                  <span class="label">Total Paid:</span>
                  <span class="value">{{ formatCurrency(booking.totalFare) }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="booking-actions">
              <h4>Actions</h4>
              <div class="action-buttons">
                <button 
                  @click="viewBookingDetails(booking)" 
                  class="btn btn-primary"
                >
                  View Details
                </button>
                <button 
                  v-if="canCancelBooking(booking)"
                  @click="confirmCancelBooking(booking)" 
                  class="btn btn-warning"
                >
                  Cancel Booking
                </button>
                <button 
                  @click="downloadTicket(booking)" 
                  class="btn btn-secondary"
                >
                  Download Ticket
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Empty State -->
        <section v-else class="empty-state">
          <div class="empty-content">
            <div class="empty-icon"><i class="fas fa-clipboard-list"></i></div>
            <h3>No Bookings Found</h3>
            <p>Try adjusting your search filters or make a new booking to see your reservations here.</p>
            <button @click="goToBooking" class="btn btn-primary">
              Make a New Booking
            </button>
          </div>
        </section>
      </div>
    </div>

    <!-- Booking Details Modal -->
    <div v-if="showDetailsModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button @click="showDetailsModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedBooking" class="booking-details-full">
            <!-- Reference and Status -->
            <div class="detail-section">
              <h3>Booking Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Reference:</span>
                  <span class="value">{{ selectedBooking.bookingReference }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Status:</span>
                  <span class="status-badge" :class="selectedBooking.status">
                    {{ formatStatus(selectedBooking.status) }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Booked At:</span>
                  <span class="value">{{ formatDateTime(selectedBooking.bookedAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Trip Details -->
            <div class="detail-section">
              <h3>Trip Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Route:</span>
                  <span class="value">{{ selectedBooking.trip?.route?.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Departure:</span>
                  <span class="value">{{ formatDateTime(selectedBooking.trip?.departureTime) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Arrival:</span>
                  <span class="value">{{ formatDateTime(selectedBooking.trip?.arrivalTime) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Bus:</span>
                  <span class="value">{{ selectedBooking.trip?.bus?.plateNumber || 'TBD' }}</span>
                </div>
              </div>
            </div>

            <!-- Passenger Details -->
            <div class="detail-section">
              <h3>Passenger Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedBooking.passengerName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedBooking.passengerEmail }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Phone:</span>
                  <span class="value">{{ selectedBooking.passengerPhone }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Type:</span>
                  <span class="value">{{ formatPassengerType(selectedBooking.passengerType) }}</span>
                </div>
              </div>
            </div>

            <!-- Price Details -->
            <div class="detail-section">
              <h3>Price Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="label">Base Fare:</span>
                  <span class="value">{{ formatCurrency(selectedBooking.fare) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Seats:</span>
                  <span class="value">{{ selectedBooking.seats?.join(', ') }}</span>
                </div>
                <div class="detail-item total">
                  <span class="label">Total Paid:</span>
                  <span class="value">{{ formatCurrency(selectedBooking.totalFare) }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Payment Method:</span>
                  <span class="value">{{ formatPaymentMethod(selectedBooking.paymentMethod) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Cancel Booking</h2>
          <button @click="showCancelModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="cancel-confirmation">
            <h3>Are you sure you want to cancel this booking?</h3>
            <p><strong>Reference:</strong> {{ bookingToCancel?.bookingReference }}</p>
            <p><strong>Route:</strong> {{ bookingToCancel?.trip?.route?.name }}</p>
            
            <div class="cancel-reason">
              <label for="cancelReason">Reason for cancellation (optional):</label>
              <textarea 
                id="cancelReason" 
                v-model="cancelReason" 
                placeholder="Please provide a reason for cancellation..."
                rows="3"
                class="reason-textarea"
              ></textarea>
            </div>

            <div class="cancel-actions">
              <button 
                @click="showCancelModal = false" 
                class="btn btn-secondary"
              >
                Keep Booking
              </button>
              <button 
                @click="executeCancelBooking" 
                :disabled="cancelling"
                class="btn btn-danger"
              >
                <span v-if="!cancelling">Confirm Cancellation</span>
                <span v-else>Cancelling...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import BookingService from '@/services/bookingService';

export default {
  name: 'RecentBookingsPage',
  setup() {
    // Reactive state
    const loading = ref(true);
    const bookings = ref([]);
    const searchEmail = ref('');
    const statusFilter = ref('');
    const showDetailsModal = ref(false);
    const showCancelModal = ref(false);
    const selectedBooking = ref(null);
    const bookingToCancel = ref(null);
    const cancelReason = ref('');
    const cancelling = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');

    // Computed properties
    const filteredBookings = computed(() => {
      let filtered = bookings.value;

      // Filter by email
      if (searchEmail.value) {
        filtered = filtered.filter(booking => 
          booking.passengerEmail.toLowerCase().includes(searchEmail.value.toLowerCase())
        );
      }

      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(booking => booking.status === statusFilter.value);
      }

      // Sort by booking date (newest first)
      return filtered.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    });

    // Methods
    const loadBookings = async (email = '') => {
      try {
        loading.value = true;
        const userEmail = email || searchEmail.value;
        
        if (userEmail) {
          bookings.value = await BookingService.getRecentBookings(userEmail);
        } else {
          // Load all bookings (admin view)
          bookings.value = [];
        }
      } catch (error) {
        errorMessage.value = 'Failed to load bookings';
      } finally {
        loading.value = false;
      }
    };

    const searchBookings = () => {
      // Search is handled by computed property
    };

    const filterBookings = () => {
      // Filter is handled by computed property
    };

    const getBookingCardClass = (status) => {
      const classes = {
        'booking-card': true
      };
      
      classes[`status-${status}`] = true;
      
      return classes;
    };

    const formatStatus = (status) => {
      const statusMap = {
        'confirmed': 'Confirmed',
        'cancelled': 'Cancelled',
        'completed': 'Completed',
        'pending': 'Pending'
      };
      
      return statusMap[status] || status;
    };

    const formatPassengerType = (type) => {
      const typeMap = {
        'adult': 'Adult',
        'child': 'Child',
        'student': 'Student',
        'elderly': 'Elderly'
      };
      
      return typeMap[type] || type;
    };

    const formatPaymentMethod = (method) => {
      const methodMap = {
        'cash': 'Cash',
        'mtn_momo': 'MTN Mobile Money',
        'airtel_money': 'Airtel Money',
        'card': 'Card'
      };
      
      return methodMap[method] || method;
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

    const getOriginStation = (booking) => {
      // Extract origin from route name
      const routeName = booking.trip?.route?.name || '';
      const parts = routeName.split(' - ');
      return parts[0] || 'Unknown';
    };

    const getDestinationStation = (booking) => {
      // Extract destination from route name
      const routeName = booking.trip?.route?.name || '';
      const parts = routeName.split(' - ');
      return parts[parts.length - 1] || 'Unknown';
    };

    const canCancelBooking = (booking) => {
      return booking.status === 'confirmed';
    };

    const viewBookingDetails = (booking) => {
      selectedBooking.value = booking;
      showDetailsModal.value = true;
    };

    const confirmCancelBooking = (booking) => {
      bookingToCancel.value = booking;
      showCancelModal.value = true;
    };

    const executeCancelBooking = async () => {
      if (!bookingToCancel.value) return;

      cancelling.value = true;
      
      try {
        const result = await BookingService.cancelBooking(
          bookingToCancel.value.bookingReference,
          cancelReason.value
        );
        
        if (result.success) {
          // Update local booking
          const index = bookings.value.findIndex(b => b.id === bookingToCancel.value.id);
          if (index > -1) {
            bookings.value[index] = result.data;
          }
          
          showCancelModal.value = false;
          bookingToCancel.value = null;
          cancelReason.value = '';
          successMessage.value = 'Booking cancelled successfully';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            successMessage.value = '';
          }, 3000);
        } else {
          errorMessage.value = result.message || 'Failed to cancel booking';
        }
      } catch (error) {
        errorMessage.value = 'Failed to cancel booking. Please try again.';
      } finally {
        cancelling.value = false;
      }
    };

    const downloadTicket = (booking) => {
      // In a real app, this would generate and download a PDF ticket
      const ticketData = {
        reference: booking.bookingReference,
        passengerName: booking.passengerName,
        route: booking.trip?.route?.name,
        departure: formatDateTime(booking.trip?.departureTime),
        arrival: formatDateTime(booking.trip?.arrivalTime),
        seats: booking.seats,
        totalFare: booking.totalFare,
        status: booking.status
      };
      
      const dataStr = JSON.stringify(ticketData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${booking.bookingReference}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const goToBooking = () => {
      // Navigate to booking page
      console.log('Navigate to booking page');
    };

    // Lifecycle
    onMounted(() => {
      // Try to get email from query params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email') || localStorage.getItem('userEmail') || '';
      
      if (email) {
        searchEmail.value = email;
      }
      
      loadBookings(email);
    });

    return {
      loading,
      bookings,
      searchEmail,
      statusFilter,
      filteredBookings,
      showDetailsModal,
      showCancelModal,
      selectedBooking,
      bookingToCancel,
      cancelReason,
      cancelling,
      successMessage,
      errorMessage,
      searchBookings,
      filterBookings,
      getBookingCardClass,
      formatStatus,
      formatPassengerType,
      formatPaymentMethod,
      formatCurrency,
      formatDateTime,
      getOriginStation,
      getDestinationStation,
      canCancelBooking,
      viewBookingDetails,
      confirmCancelBooking,
      executeCancelBooking,
      downloadTicket,
      goToBooking
    };
  }
};
</script>

<style scoped>
.recent-bookings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  margin: -20px -20px 30px -20px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-header p {
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

.bookings-content {
  padding: 30px;
}

.search-section {
  margin-bottom: 30px;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.search-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: end;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.search-input, .filter-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 1rem;
}

.bookings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.booking-card {
  border: 2px solid #e1e5e1;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.booking-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.booking-card.status-confirmed {
  border-left: 4px solid #28a745;
}

.booking-card.status-cancelled {
  border-left: 4px solid #dc3545;
  opacity: 0.7;
}

.booking-card.status-completed {
  border-left: 4px solid #28a745;
}

.booking-header {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.booking-reference .label,
.booking-status .label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.booking-reference .value {
  font-weight: 700;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.confirmed {
  background: #28a745;
  color: white;
}

.status-badge.cancelled {
  background: #dc3545;
  color: white;
}

.status-badge.completed {
  background: #6c757d;
  color: white;
}

.booking-route, .booking-passenger, .booking-seats, .booking-price, .booking-actions {
  padding: 20px;
  border-bottom: 1px solid #e1e5e1;
}

.booking-route h3,
.booking-passenger h4,
.booking-seats h4,
.booking-price h4,
.booking-actions h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
}

.route-details, .passenger-info, .seats-info, .price-info {
  display: grid;
  gap: 10px;
}

.route-item, .passenger-item, .seats-item, .price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.route-item:last-child,
.passenger-item:last-child,
.seats-item:last-child,
.price-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
}

.price-item.total {
  font-weight: 700;
  font-size: 1.2rem;
  color: #667eea;
  padding-top: 10px;
  border-top: 2px solid #e1e5e1;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-warning {
  background: #ffc107;
  color: #333;
}

.btn-warning:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e1e5e1;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  color: #333;
  margin-bottom: 15px;
}

.empty-state p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
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
  border-radius: 12px;
  max-width: 600px;
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

.booking-details-full {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 25px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  border-bottom: 2px solid #e1e5e1;
  padding-bottom: 10px;
}

.detail-grid {
  display: grid;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.cancel-confirmation {
  text-align: center;
}

.cancel-confirmation h3 {
  color: #dc3545;
  margin-bottom: 20px;
}

.cancel-confirmation p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.cancel-reason {
  margin: 20px 0;
}

.reason-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e1;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.cancel-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1001;
  max-width: 300px;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .container {
    margin: 10px;
    border-radius: 8px;
  }
  
  .page-header {
    padding: 20px;
    margin: -10px -10px 20px -10px;
  }
  
  .bookings-content {
    padding: 20px;
  }
  
  .bookings-grid {
    grid-template-columns: 1fr;
  }
  
  .search-controls {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}

/* Dark mode overrides */
html.dark .recent-bookings-page { background: linear-gradient(135deg, #141414 0%, #0a0a0a 100%); }
html.dark .container { background: var(--bg-primary); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
html.dark .bookings-content { color: var(--text-primary); }
html.dark .search-section { background: var(--bg-secondary); }
html.dark .form-group label { color: var(--text-secondary); }
html.dark .search-input, html.dark .filter-select { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
html.dark .booking-card { border-color: var(--border-color); background: var(--bg-secondary); }
html.dark .booking-header { background: var(--card-bg); }
html.dark .booking-reference .label, html.dark .booking-status .label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .booking-reference .value { color: var(--text-primary); }
html.dark .booking-route, html.dark .booking-passenger, html.dark .booking-seats, html.dark .booking-price, html.dark .booking-actions { border-color: var(--border-color); }
html.dark .booking-route h3, html.dark .booking-passenger h4, html.dark .booking-seats h4, html.dark .booking-price h4, html.dark .booking-actions h4 { color: var(--text-primary); }
html.dark .label { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .value { color: var(--text-primary); }
html.dark .route-item, html.dark .passenger-item, html.dark .seats-item, html.dark .price-item { border-color: var(--border-color); }
html.dark .empty-state h3 { color: var(--text-primary); }
html.dark .empty-state p { color: var(--text-secondary); }
html.dark .empty-icon { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .loading p { color: var(--text-primary); }
html.dark .spinner { border-color: var(--border-color); border-top-color: #667eea; }
html.dark .modal-content { background: var(--bg-primary); }
html.dark .modal-header { border-color: var(--border-color); }
html.dark .modal-header h2 { color: var(--text-primary); }
html.dark .close-btn { color: var(--text-muted, rgba(255,255,255,0.4)); }
html.dark .detail-section h3 { color: var(--text-primary); border-color: var(--border-color); }
html.dark .detail-item { border-color: var(--border-color); }
html.dark .cancel-confirmation h3 { color: #EF5350; }
html.dark .cancel-confirmation p { color: var(--text-secondary); }
html.dark .reason-textarea { background: var(--card-bg); border-color: var(--border-color); color: var(--text-primary); }
html.dark .btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); }
html.dark .price-item.total { border-color: var(--border-color); }
html.dark .page-header { background: linear-gradient(135deg, #141414 0%, #0a0a0a 100%); }
html.dark .loading p { color: var(--text, rgba(255,255,255,0.85)); }
html.dark .spinner { border-color: var(--border, rgba(255,255,255,0.07)); border-top-color: var(--green, #22c55e); }
html.dark .btn-primary { background: var(--green, #22c55e); color: #fff; }
html.dark .btn-primary:hover { background: #16a34a; }
html.dark .reason-textarea { background: var(--bg, #0a0a0a); border-color: var(--border, rgba(255,255,255,0.07)); color: var(--text, rgba(255,255,255,0.85)); }
</style>
