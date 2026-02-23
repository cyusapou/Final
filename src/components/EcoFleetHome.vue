<template>
  <div class="app-container">
    <!-- Language Toggle -->
    <div class="lang-toggle">
      <button 
        v-for="lang in ['en', 'rw']" 
        :key="lang"
        :class="['lang-btn', { active: currentLang === lang }]"
        @click="setLanguage(lang)"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>

    <!-- Screen 1: Landing -->
    <div v-if="currentScreen === 'landing'" class="screen landing-screen">
      <div class="hero-section">
        <div class="logo-wrap">
          <div class="logo-icon">
            <i class="fas fa-bus"></i>
          </div>
          <div class="logo-text">
            <h1>On The Go</h1>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
        
        <h2 class="headline">{{ t.heroTitle }}</h2>
        <p class="subheadline">{{ t.heroSubtitle }}</p>
        
        <button class="btn-primary btn-large" @click="goToExpress">
          {{ t.boardNow }}
          <i class="fas fa-arrow-right"></i>
        </button>
        
        <p class="hint">{{ t.selectDateHint }}</p>
      </div>
    </div>

    <!-- Screen 1.5: Express Selection -->
    <div v-if="currentScreen === 'express'" class="screen express-screen">
      <div class="header">
        <button class="btn-back" @click="goToLanding">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.selectExpress }}</h2>
      </div>

      <p class="screen-desc">{{ t.chooseExpress }}</p>

      <!-- Express Cards -->
      <div class="express-grid">
        <div 
          v-for="express in expressCompanies" 
          :key="express.id"
          class="express-card"
          @click="selectExpress(express)"
        >
          <div class="express-logo">
            <img v-if="express.logo" :src="express.logo" :alt="express.name">
            <i v-else class="fas fa-bus"></i>
          </div>
          <div class="express-info">
            <h3>{{ express.name }}</h3>
            <p>{{ express.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Screen 2: Bus Trips -->
    <div v-if="currentScreen === 'trips'" class="screen trips-screen">
      <div class="header">
        <button class="btn-back" @click="goToExpress">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ selectedExpress?.name }} - {{ t.selectTrip }}</h2>
      </div>

      <!-- Date Picker -->
      <div class="date-picker-row">
        <div class="date-picker">
          <label class="picker-label">{{ t.date }}</label>
          <div class="picker-wrap">
            <i class="fas fa-calendar"></i>
            <input 
              type="date" 
              v-model="selectedDate" 
              :min="minDate"
              class="picker-input"
            >
          </div>
        </div>
      </div>

      <p class="trips-info">{{ t.tripsFrom }} 4:00 AM - 8:00 PM</p>

      <!-- Bus Trip Cards -->
      <div class="trips-list">
        <div 
          v-for="trip in busTrips" 
          :key="trip.id"
          class="trip-card"
          @click="selectTrip(trip)"
        >
          <div class="trip-header">
            <div class="trip-express">
              <div class="express-logo-sm">
                <i class="fas fa-bus"></i>
              </div>
              <span>{{ selectedExpress?.name }}</span>
            </div>
            <div class="trip-time">
              <span class="departure">{{ trip.departure }}</span>
              <span class="arrow">→</span>
              <span class="arrival">{{ trip.arrival }}</span>
            </div>
          </div>

          <div class="trip-details">
            <div class="bus-plate">{{ trip.plate }}</div>
            <div class="bus-features">
              <span v-if="trip.wifi" class="feature"><i class="fas fa-wifi"></i> WiFi</span>
              <span v-if="trip.luggage" class="feature"><i class="fas fa-suitcase"></i> Luggage</span>
              <span v-if="trip.airConditioning" class="feature"><i class="fas fa-snowflake"></i> A/C</span>
              <span v-if="trip.reclining" class="feature"><i class="fas fa-chair"></i> Reclining</span>
            </div>
          </div>

          <div class="trip-footer">
            <div class="driver-contact">
              <i class="fas fa-phone"></i>
              <span>{{ trip.driverPhone }}</span>
            </div>
            <div class="seats-info">
              <span class="available">{{ trip.availableSeats }} {{ t.seatsAvailable }}</span>
              <span class="price">RWF {{ trip.price }}</span>
            </div>
          </div>

          <button class="btn-select-trip">{{ t.select }}</button>
        </div>
      </div>
    </div>

    <!-- Screen 3: Destination -->
    <div v-if="currentScreen === 'destination'" class="screen destination-screen">
      <div class="header">
        <button class="btn-back" @click="goToTrips">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.selectDestination }}</h2>
      </div>

      <p class="screen-desc">{{ t.chooseDestination }}</p>

      <!-- Destination Cards -->
      <div class="dest-grid">
        <div 
          v-for="dest in destinations" 
          :key="dest.id"
          class="dest-card"
          @click="selectDestination(dest)"
        >
          <div class="dest-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="dest-info">
            <h3>{{ dest.name }}</h3>
            <p>{{ dest.province }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Screen 4: Price Summary -->
    <div v-if="currentScreen === 'summary'" class="screen summary-screen">
      <div class="header">
        <button class="btn-back" @click="goToDestination">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.tripSummary }}</h2>
      </div>

      <!-- Summary Card -->
      <div class="summary-card">
        <div class="summary-route">
          <div class="route-express">
            <div class="express-logo-sm">
              <i class="fas fa-bus"></i>
            </div>
            <span>{{ selectedExpress?.name }}</span>
          </div>
          <div class="route-time">
            {{ selectedTrip?.departure }} → {{ selectedTrip?.arrival }}
          </div>
        </div>

        <div class="summary-details">
          <div class="detail-row">
            <span class="label">{{ t.date }}</span>
            <span class="value">{{ formatDate(selectedDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t.bus }}</span>
            <span class="value">{{ selectedTrip?.plate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t.destination }}</span>
            <span class="value">{{ selectedDestination?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">{{ t.driver }}</span>
            <span class="value">{{ selectedTrip?.driverPhone }}</span>
          </div>
        </div>

        <div class="price-row">
          <span class="label">{{ t.totalPrice }}</span>
          <span class="price">RWF {{ selectedTrip?.price }}</span>
        </div>

        <button class="btn-primary btn-large btn-pay" @click="goToPayment">
          {{ t.proceedToPay }}
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Screen 5: Payment -->
    <div v-if="currentScreen === 'payment'" class="screen payment-screen">
      <div class="header">
        <button class="btn-back" @click="goToSummary">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.selectPayment }}</h2>
      </div>

      <!-- Payment Options -->
      <div v-if="!showTicket" class="payment-options">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id"
          class="payment-card"
          @click="processPayment(method)"
        >
          <div class="payment-icon">
            <i :class="method.icon"></i>
          </div>
          <span>{{ method.name }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isProcessing" class="loading">
        <div class="spinner"></div>
        <p>{{ t.processing }}</p>
      </div>

      <!-- Ticket -->
      <div v-if="showTicket" class="ticket-view">
        <div class="success-box">
          <div class="checkmark">
            <i class="fas fa-check"></i>
          </div>
          <h2>{{ t.boomSet }}</h2>
        </div>

        <div class="ticket-card">
          <div class="qr-box">
            <i class="fas fa-qrcode"></i>
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">{{ t.express }}</span>
              <span class="value">{{ selectedExpress?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.destination }}</span>
              <span class="value">{{ selectedDestination?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.departureTime }}</span>
              <span class="value">{{ selectedTrip?.departure }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.bus }}</span>
              <span class="value">{{ selectedTrip?.plate }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.pricePaid }}</span>
              <span class="value text-green">RWF {{ selectedTrip?.price }}</span>
            </div>
          </div>

          <div class="stop-code-box">
            <span class="code-label">{{ t.busStopCode }}</span>
            <span class="code-value">{{ stopCode }}</span>
            <p class="code-note">{{ t.busStopCodeNote }}</p>
          </div>
        </div>

        <div class="ticket-buttons">
          <button class="btn-primary btn-full" @click="downloadTicket">
            <i class="fas fa-download"></i>
            {{ t.downloadTicket }}
          </button>
          <button class="btn-outline btn-full" @click="trackBus">
            <i class="fas fa-map-marker-alt"></i>
            {{ t.trackBus }}
          </button>
        </div>

        <button class="btn-secondary btn-full" @click="goToLanding">
          {{ t.newBooking }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { translations } from '../translations/index.js'

// ============ STATE ============
const currentScreen = ref('landing')
const currentLang = ref('en')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showTicket = ref(false)
const isProcessing = ref(false)
const stopCode = ref('4782')

const selectedExpress = ref(null)
const selectedTrip = ref(null)
const selectedDestination = ref(null)

// ============ TRANSLATIONS ============
const t = computed(() => translations[currentLang.value])

// ============ COMPUTED ============
const minDate = computed(() => new Date().toISOString().split('T')[0])

// ============ DATA: Express Companies ============
const expressCompanies = ref([
  { id: 1, name: 'RITCO Ltd', description: 'Comfortable & punctual, government-partnered', logo: '' },
  { id: 2, name: 'Volcano Express', description: 'Popular for northern routes, frequent & reliable', logo: '' },
  { id: 3, name: 'Trinity Express', description: 'Cross-border to Uganda & Tanzania', logo: '' },
  { id: 4, name: 'Virunga Express', description: 'Reliable for north & intercity travel', logo: '' },
  { id: 5, name: 'Horizon Express', description: 'Good service & comfort', logo: '' },
  { id: 6, name: 'Stella Express', description: 'Modern with electric buses', logo: '' },
  { id: 7, name: 'Different Express', description: 'Regular intercity service', logo: '' },
  { id: 8, name: 'La Colombe Express', description: 'Northern & western routes', logo: '' },
  { id: 9, name: 'International Express', description: 'Regional lines', logo: '' },
  { id: 10, name: 'Ruhire Express', description: 'Eastern & southern routes', logo: '' },
  { id: 11, name: 'Select Express', description: 'International & regional', logo: '' },
  { id: 12, name: 'Yahoo Car Express', description: 'To Burundi borders', logo: '' },
  { id: 13, name: 'Capital Express', description: 'Kigali-Muhanga domestic', logo: '' },
  { id: 14, name: 'Kigali Bus Services', description: 'Urban & regional', logo: '' },
])

// ============ DATA: Bus Trips (4am - 8pm) ============
const generateTrips = () => {
  const trips = []
  const times = ['4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
  const plates = ['RAC 123X', 'RAC 456Y', 'RAC 789Z', 'RAC 321W', 'RAC 654V', 'RAD 111A', 'RAD 222B', 'RAD 333C']
  const drivers = ['+250 788 111 111', '+250 788 222 222', '+250 788 333 333', '+250 788 444 444']
  
  times.forEach((time, index) => {
    const hour = parseInt(time.split(':')[0])
    trips.push({
      id: index + 1,
      departure: time,
      arrival: `${hour + 1}:30`,
      plate: plates[index % plates.length],
      driverPhone: drivers[index % drivers.length],
      price: '2500',
      availableSeats: Math.floor(Math.random() * 35) + 5,
      totalSeats: 40,
      wifi: Math.random() > 0.5,
      luggage: true,
      airConditioning: Math.random() > 0.6,
      reclining: Math.random() > 0.4,
    })
  })
  return trips
}

const busTrips = ref(generateTrips())

// ============ DATA: Destinations ============
const destinations = ref([
  { id: 1, name: 'Nyanza', province: 'Southern Province' },
  { id: 2, name: 'Huye', province: 'Southern Province' },
  { id: 3, name: 'Gisagara', province: 'Southern Province' },
  { id: 4, name: 'Nyaruguru', province: 'Southern Province' },
  { id: 5, name: 'Kamonyi', province: 'Southern Province' },
  { id: 6, name: 'Ruhango', province: 'Southern Province' },
  { id: 7, name: 'Muhanga', province: 'Southern Province' },
  { id: 8, name: 'Musanze', province: 'Northern Province' },
  { id: 9, name: 'Rubavu', province: 'Western Province' },
  { id: 10, name: 'Nyabihu', province: 'Western Province' },
  { id: 11, name: 'Karongi', province: 'Western Province' },
  { id: 12, name: 'Rutsiro', province: 'Western Province' },
  { id: 13, name: 'Nyamasheke', province: 'Western Province' },
  { id: 14, name: ' Rusizi', province: 'Western Province' },
  { id: 15, name: 'Bugesera', province: 'Eastern Province' },
  { id: 16, name: 'Kayonza', province: 'Eastern Province' },
  { id: 17, name: 'Rwamagana', province: 'Eastern Province' },
  { id: 18, name: 'Kirehe', province: 'Eastern Province' },
  { id: 19, name: 'Ngoma', province: 'Eastern Province' },
  { id: 20, name: 'Gatsibo', province: 'Eastern Province' },
])

const paymentMethods = [
  { id: 1, name: 'Mobile Money', icon: 'fas fa-mobile-alt' },
  { id: 2, name: 'Debit Card', icon: 'fas fa-credit-card' },
  { id: 3, name: 'On The Go Wallet', icon: 'fas fa-wallet' },
]

// ============ METHODS ============
const setLanguage = (lang) => {
  currentLang.value = lang
}

// Navigation
const goToLanding = () => {
  currentScreen.value = 'landing'
  showTicket.value = false
  resetSelections()
}

const goToExpress = () => {
  currentScreen.value = 'express'
}

const goToTrips = () => {
  currentScreen.value = 'trips'
  busTrips.value = generateTrips() // Reset trips
}

const goToDestination = () => {
  currentScreen.value = 'destination'
}

const goToSummary = () => {
  currentScreen.value = 'summary'
}

const goToPayment = () => {
  currentScreen.value = 'payment'
  showTicket.value = false
}

// Selection
const selectExpress = (express) => {
  selectedExpress.value = express
  goToTrips()
}

const selectTrip = (trip) => {
  selectedTrip.value = trip
  goToDestination()
}

const selectDestination = (dest) => {
  selectedDestination.value = dest
  goToSummary()
}

const resetSelections = () => {
  selectedExpress.value = null
  selectedTrip.value = null
  selectedDestination.value = null
}

// Payment
const processPayment = (method) => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    showTicket.value = true
    stopCode.value = Math.floor(1000 + Math.random() * 9000).toString()
  }, 2000)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
}

const downloadTicket = () => {
  alert('Download ticket - connect to backend')
}

const trackBus = () => {
  alert('Track bus - connect to backend')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

/* ============ Base ============ */
.app-container {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 70px;
}

/* ============ Language Toggle ============ */
.lang-toggle {
  position: fixed;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 100;
}

.lang-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  color: #424242;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

/* ============ Screens ============ */
.screen {
  min-height: 100vh;
  padding: 20px;
}

/* ============ Header ============ */
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-top: 32px;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
}

.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  color: #424242;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #E8F5E9;
  color: #2E7D32;
}

.screen-desc {
  font-size: 14px;
  color: #757575;
  margin-bottom: 20px;
}

/* ============ Landing ============ */
.landing-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F5E9 0%, #FFF 60%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 480px;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
  justify-content: center;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: #2E7D32;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i {
  color: #FFF;
  font-size: 24px;
}

.logo-text {
  text-align: left;
}

.logo-text h1 {
  font-size: 26px;
  font-weight: 700;
  color: #212121;
  line-height: 1.2;
}

.logo-text span {
  font-size: 13px;
  color: #757575;
}

.headline {
  font-size: 32px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 8px;
}

.subheadline {
  font-size: 16px;
  color: #424242;
  margin-bottom: 28px;
}

.hint {
  font-size: 13px;
  color: #757575;
}

/* ============ Buttons ============ */
.btn-primary {
  background: #2E7D32;
  color: #FFF;
  border: none;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.btn-primary:hover {
  background: #1B5E20;
}

.btn-secondary {
  background: #1976D2;
  color: #FFF;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  border: 1.5px solid #2E7D32;
  color: #2E7D32;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-large {
  padding: 16px 40px;
  font-size: 17px;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

.btn-pay {
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}

/* ============ Express Grid ============ */
.express-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .express-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .express-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.express-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #FFF;
  border-radius: 12px;
  border: 1px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.express-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.express-logo {
  width: 50px;
  height: 50px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.express-logo img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.express-logo i {
  color: #2E7D32;
  font-size: 20px;
}

.express-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 2px;
}

.express-info p {
  font-size: 12px;
  color: #757575;
  margin: 0;
}

/* ============ Trips ============ */
.date-picker-row {
  margin-bottom: 16px;
}

.date-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.picker-label {
  font-size: 12px;
  font-weight: 600;
  color: #424242;
}

.picker-wrap {
  position: relative;
}

.picker-wrap i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  font-size: 14px;
}

.picker-input {
  padding: 12px 14px 12px 38px;
  border: 1.5px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  background: #FFF;
  font-family: inherit;
  width: 200px;
}

.picker-input:focus {
  outline: none;
  border-color: #2E7D32;
}

.trips-info {
  font-size: 14px;
  color: #757575;
  margin-bottom: 16px;
}

.trips-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

@media (min-width: 768px) {
  .trips-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.trip-card {
  background: #FFF;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.trip-card:hover {
  border-color: #2E7D32;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.trip-express {
  display: flex;
  align-items: center;
  gap: 8px;
}

.express-logo-sm {
  width: 32px;
  height: 32px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.express-logo-sm i {
  color: #2E7D32;
  font-size: 14px;
}

.trip-express span {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

.trip-time {
  font-size: 16px;
  font-weight: 700;
  color: #2E7D32;
}

.trip-time .arrow {
  color: #1976D2;
  margin: 0 6px;
}

.trip-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F5F5F5;
}

.bus-plate {
  font-size: 14px;
  font-weight: 700;
  color: #212121;
  background: #F5F5F5;
  padding: 4px 10px;
  border-radius: 4px;
}

.bus-features {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.feature {
  font-size: 11px;
  color: #757575;
  background: #F5F5F5;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.feature i {
  color: #1976D2;
}

.trip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.driver-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #757575;
}

.driver-contact i {
  color: #2E7D32;
}

.seats-info {
  text-align: right;
}

.seats-info .available {
  display: block;
  font-size: 11px;
  color: #757575;
}

.seats-info .price {
  font-size: 16px;
  font-weight: 700;
  color: #2E7D32;
}

.btn-select-trip {
  width: 100%;
  padding: 12px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* ============ Destination ============ */
.dest-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .dest-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dest-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.dest-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #FFF;
  border-radius: 10px;
  border: 1px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.dest-card:hover {
  border-color: #2E7D32;
}

.dest-icon {
  width: 40px;
  height: 40px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dest-icon i {
  color: #2E7D32;
  font-size: 16px;
}

.dest-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 2px;
}

.dest-info p {
  font-size: 11px;
  color: #757575;
  margin: 0;
}

/* ============ Summary ============ */
.summary-card {
  background: #FFF;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E8E8E8;
}

.summary-route {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #F5F5F5;
  margin-bottom: 16px;
}

.summary-route .route-express {
  justify-content: center;
  margin-bottom: 8px;
}

.summary-route .route-time {
  font-size: 18px;
}

.summary-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-size: 13px;
  color: #757575;
}

.detail-row .value {
  font-size: 13px;
  font-weight: 600;
  color: #212121;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #E8F5E9;
  border-radius: 8px;
}

.price-row .label {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

.price-row .price {
  font-size: 24px;
  font-weight: 700;
  color: #2E7D32;
}

/* ============ Payment ============ */
.payment-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 20px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #FFF;
  border-radius: 10px;
  border: 1.5px solid #E8E8E8;
  cursor: pointer;
  flex: 0 1 calc(33.333% - 10px);
  min-width: 180px;
}

.payment-card:hover {
  border-color: #2E7D32;
}

.payment-icon {
  width: 40px;
  height: 40px;
  background: #E8F5E9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-icon i {
  color: #2E7D32;
  font-size: 16px;
}

.payment-card span {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

/* ============ Loading ============ */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #E8E8E8;
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============ Ticket ============ */
.ticket-view {
  max-width: 400px;
  margin: 0 auto;
}

.success-box {
  text-align: center;
  margin-bottom: 20px;
}

.checkmark {
  width: 60px;
  height: 60px;
  background: #2E7D32;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.checkmark i {
  color: #FFF;
  font-size: 26px;
}

.success-box h2 {
  font-size: 22px;
  font-weight: 700;
  color: #2E7D32;
}

.ticket-card {
  background: #FFF;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #E8E8E8;
  margin-bottom: 20px;
}

.qr-box {
  width: 100px;
  height: 100px;
  background: #F5F5F5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

.qr-box i {
  font-size: 50px;
  color: #212121;
}

.ticket-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 13px;
  color: #757575;
}

.info-row .value {
  font-size: 13px;
  font-weight: 600;
  color: #212121;
}

.text-green {
  color: #2E7D32;
}

.stop-code-box {
  background: #E8F5E9;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.code-label {
  display: block;
  font-size: 11px;
  color: #757575;
  margin-bottom: 6px;
}

.code-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #2E7D32;
  letter-spacing: 3px;
  margin-bottom: 6px;
}

.code-note {
  font-size: 11px;
  color: #757575;
  margin: 0;
  line-height: 1.4;
}

.ticket-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

/* ============ Bottom Nav ============ */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFF;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #757575;
  cursor: pointer;
  padding: 6px 12px;
  transition: all 0.2s;
}

.nav-item.active {
  color: #2E7D32;
}

.nav-item i {
  font-size: 18px;
}

.nav-item span {
  font-size: 10px;
  font-weight: 500;
}

/* ============ Responsive ============ */
@media (max-width: 600px) {
  .headline {
    font-size: 26px;
  }
  
  .btn-large {
    padding: 14px 32px;
    font-size: 16px;
  }
  
  .dest-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-card {
    flex: 0 1 100%;
  }
  
  .picker-input {
    width: 100%;
  }
}
</style>
