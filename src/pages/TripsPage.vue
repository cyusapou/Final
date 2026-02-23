<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="trips-layout">
      <!-- Desktop Filters Sidebar -->
      <aside class="filters-sidebar" :class="{ open: showFilters }">
        <div class="filters-header">
          <h3>{{ t.filters }}</h3>
          <button class="clear-filters" @click="clearFilters">{{ t.clearFilters }}</button>
        </div>

        <!-- Time of Day -->
        <div class="filter-section">
          <label class="filter-label">{{ t.timeOfDay }}</label>
          <div class="filter-pills">
            <button 
              :class="['pill', { active: filters.timeOfDay === 'morning' }]"
              @click="setTimeFilter('morning')"
            >
              {{ t.morning }}
            </button>
            <button 
              :class="['pill', { active: filters.timeOfDay === 'afternoon' }]"
              @click="setTimeFilter('afternoon')"
            >
              {{ t.afternoon }}
            </button>
            <button 
              :class="['pill', { active: filters.timeOfDay === 'evening' }]"
              @click="setTimeFilter('evening')"
            >
              {{ t.evening }}
            </button>
          </div>
        </div>

        <!-- Amenities -->
        <div class="filter-section">
          <label class="filter-label">{{ t.amenities }}</label>
          <div class="filter-chips">
            <button 
              :class="['chip', { active: filters.amenities.wifi }]"
              @click="toggleAmenity('wifi')"
            >
              <i class="fas fa-wifi"></i> {{ t.wifi }}
            </button>
            <button 
              :class="['chip', { active: filters.amenities.airConditioning }]"
              @click="toggleAmenity('airConditioning')"
            >
              <i class="fas fa-snowflake"></i> {{ t.airConditioning }}
            </button>
            <button 
              :class="['chip', { active: filters.amenities.reclining }]"
              @click="toggleAmenity('reclining')"
            >
              <i class="fas fa-chair"></i> {{ t.reclining }}
            </button>
          </div>
        </div>

        <!-- Min Seats -->
        <div class="filter-section">
          <label class="filter-label">{{ t.minSeats }}</label>
          <select v-model="filters.minSeats" class="seat-select">
            <option :value="0">{{ t.anySeats }}</option>
            <option :value="5">5+</option>
            <option :value="10">10+</option>
            <option :value="20">20+</option>
          </select>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="trips-main">
        <div class="screen trips-screen">
          <div class="header">
            <button class="btn-back" @click="goToExpress">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h2>{{ store.selectedExpress?.name }} - {{ t.selectTrip }}</h2>
          </div>

          <!-- Filter Toggle (Mobile) -->
          <div class="filter-bar">
            <div class="date-picker-row">
              <div class="date-picker">
                <label class="picker-label">{{ t.date }}</label>
                <div class="picker-wrap">
                  <i class="fas fa-calendar"></i>
                  <input 
                    type="date" 
                    v-model="store.selectedDate" 
                    :min="minDate"
                    class="picker-input"
                  >
                </div>
              </div>
            </div>
            <button class="filter-toggle-btn" @click="toggleFilters">
              <i class="fas fa-filter"></i>
              {{ t.filters }}
              <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
            </button>
          </div>

          <!-- Trip Count -->
          <p class="trips-info">
            {{ t.showingTrips.replace('{count}', filteredTrips.length).replace('{total}', busTrips.length) }}
          </p>

          <!-- Bus Trip Cards -->
          <div class="trips-list">
            <div 
              v-for="trip in filteredTrips" 
              :key="trip.id"
              class="trip-card"
              @click="selectTrip(trip)"
            >
              <div class="trip-header">
                <div class="trip-express">
                  <div class="express-logo-sm">
                    <i class="fas fa-bus"></i>
                  </div>
                  <span>{{ store.selectedExpress?.name }}</span>
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
                  <!-- Seat Availability Visual -->
                  <div class="seats-bar-container">
                    <span class="available">{{ trip.availableSeats }} {{ t.seatsAvailable }}</span>
                    <div class="seats-bar">
                      <div 
                        class="seats-fill" 
                        :class="getSeatColor(trip.availableSeats, trip.totalSeats)"
                        :style="{ width: (trip.availableSeats / trip.totalSeats * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                  <span class="price">RWF {{ trip.price }}</span>
                </div>
              </div>

              <button class="btn-select-trip">{{ t.select }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const minDate = computed(() => new Date().toISOString().split('T')[0])

// Filter state
const filters = reactive({
  timeOfDay: null,
  amenities: {
    wifi: false,
    airConditioning: false,
    reclining: false,
  },
  minSeats: 0,
})

const showFilters = ref(false)

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.timeOfDay) count++
  if (filters.amenities.wifi) count++
  if (filters.amenities.airConditioning) count++
  if (filters.amenities.reclining) count++
  if (filters.minSeats > 0) count++
  return count
})

// Toggle filters (mobile)
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Set time filter
const setTimeFilter = (time) => {
  filters.timeOfDay = filters.timeOfDay === time ? null : time
}

// Toggle amenity
const toggleAmenity = (amenity) => {
  filters.amenities[amenity] = !filters.amenities[amenity]
}

// Clear all filters
const clearFilters = () => {
  filters.timeOfDay = null
  filters.amenities.wifi = false
  filters.amenities.airConditioning = false
  filters.amenities.reclining = false
  filters.minSeats = 0
}

// Get seat color based on availability
const getSeatColor = (available, total) => {
  const percentage = (available / total) * 100
  if (percentage > 50) return 'green'
  if (percentage >= 20) return 'yellow'
  return 'red'
}

// Generate trips
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

// Filtered trips
const filteredTrips = computed(() => {
  return busTrips.value.filter(trip => {
    // Time of day filter
    if (filters.timeOfDay) {
      const hour = parseInt(trip.departure.split(':')[0])
      if (filters.timeOfDay === 'morning' && (hour < 4 || hour >= 12)) return false
      if (filters.timeOfDay === 'afternoon' && (hour < 12 || hour >= 18)) return false
      if (filters.timeOfDay === 'evening' && hour < 18) return false
    }
    
    // Amenities filter
    if (filters.amenities.wifi && !trip.wifi) return false
    if (filters.amenities.airConditioning && !trip.airConditioning) return false
    if (filters.amenities.reclining && !trip.reclining) return false
    
    // Min seats filter
    if (filters.minSeats > 0 && trip.availableSeats < filters.minSeats) return false
    
    return true
  })
})

const goToExpress = () => {
  router.push('/express')
}

const selectTrip = (trip) => {
  store.selectedTrip = trip
  router.push('/destination')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page-wrapper {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #F5F5F5;
}

.mobile-lang-toggle {
  display: block;
}

/* Desktop sidebar spacing */
@media (min-width: 1024px) {
  .mobile-lang-toggle {
    display: none;
  }
}

.trips-layout {
  display: flex;
  flex-direction: column;
}

/* Desktop: Side filters */
@media (min-width: 1024px) {
  .trips-layout {
    flex-direction: row;
  }
  
  .filters-sidebar {
    display: block;
    width: 280px;
    flex-shrink: 0;
    background: #FFF;
    border-right: 1px solid #E8E8E8;
    padding: 20px;
    height: calc(100vh - 130px);
    overflow-y: auto;
    position: sticky;
    top: 0;
  }
}

/* Mobile: Filters hidden by default */
.filters-sidebar {
  display: none;
}

.filters-sidebar.open {
  display: block;
}

@media (max-width: 1023px) {
  .filters-sidebar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 70px;
    top: auto;
    height: auto;
    max-height: 60vh;
    background: #FFF;
    border-top: 1px solid #E8E8E8;
    border-radius: 16px 16px 0 0;
    padding: 20px;
    z-index: 90;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  }
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}

.clear-filters {
  background: none;
  border: none;
  color: #2E7D32;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.clear-filters:hover {
  text-decoration: underline;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 10px;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  font-size: 12px;
  color: #424242;
  cursor: pointer;
  transition: all 0.2s;
}

.pill:hover {
  border-color: #2E7D32;
}

.pill.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  font-size: 12px;
  color: #424242;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  border-color: #2E7D32;
}

.chip.active {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #2E7D32;
}

.chip i {
  font-size: 12px;
}

.seat-select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  background: #FFF;
  font-family: inherit;
  cursor: pointer;
}

.seat-select:focus {
  outline: none;
  border-color: #2E7D32;
}

.trips-main {
  flex: 1;
}

.screen {
  min-height: 100vh;
  padding: 20px;
}

@media (min-width: 1024px) {
  .screen {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 32px;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-top: 16px;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
}

@media (min-width: 1024px) {
  .header h2 {
    font-size: 22px;
  }
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
}

.date-picker-row {
  flex: 1;
  min-width: 200px;
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
  width: 100%;
}

.picker-input:focus {
  outline: none;
  border-color: #2E7D32;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1.5px solid #E8E8E8;
  background: #FFF;
  font-size: 14px;
  font-weight: 500;
  color: #424242;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-btn:hover {
  border-color: #2E7D32;
}

@media (min-width: 1024px) {
  .filter-toggle-btn {
    display: none;
  }
}

.filter-badge {
  background: #2E7D32;
  color: #FFF;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
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
  border: 1.5px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.trip-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.trip-card:active {
  transform: translateY(0);
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
  align-items: flex-start;
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

.seats-bar-container {
  margin-bottom: 4px;
}

.seats-bar-container .available {
  display: block;
  font-size: 11px;
  color: #757575;
  margin-bottom: 4px;
}

.seats-bar {
  width: 60px;
  height: 4px;
  background: #E8E8E8;
  border-radius: 2px;
  overflow: hidden;
}

.seats-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.seats-fill.green {
  background: #2E7D32;
}

.seats-fill.yellow {
  background: #F9A825;
}

.seats-fill.red {
  background: #E53935;
}

.seats-info .price {
  display: block;
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
  transition: background 0.2s;
}

.btn-select-trip:hover {
  background: #1B5E20;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
  
  .picker-input {
    width: 100%;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Bottom nav spacing on mobile */
@media (max-width: 1023px) {
  .page-wrapper {
    padding-bottom: 70px;
  }
}
</style>
