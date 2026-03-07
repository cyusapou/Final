<template>
  <div class="journey-tracker">
    <!-- Step 1: Select Destination Location -->
    <div v-if="!toLocation" class="step-select-destination">
      <div class="step-header">
        <div class="step-number">1</div>
        <div>
          <h3>{{ t.selectDestination || 'Select Destination' }}</h3>
          <p class="step-subtitle">{{ t.chooseDestination || 'Where are you going?' }}</p>
        </div>
      </div>

      <!-- Destination Picker -->
      <div class="destination-picker-wrapper">
        <LocationPicker 
          :placeholder="t.searchStop || 'Search a location'"
          @location-selected="selectDestination"
        />
      </div>

      <!-- Or use current location as starting point -->
      <div v-if="userLocation && userLocation.latitude" class="from-location-section">
        <div class="from-location-info">
          <i class="fas fa-map-pin"></i>
          <div class="location-details">
            <span class="label">{{ t.departingFrom || 'Departing from' }}</span>
            <p class="location-name">{{ fromLocationDisplay }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: View Destination & Nearby Stops -->
    <div v-else-if="!selectedOriginStop" class="step-view-destination">
      <div class="step-header">
        <div class="step-number">2</div>
        <div>
          <h3>{{ t.nearestStops || 'Nearest Bus Stops' }}</h3>
          <p class="step-subtitle">{{ t.pickUpFrom || 'Pick up from nearby stops' }}</p>
        </div>
        <button class="back-btn" @click="backToDestination" title="Back">
          <i class="fas fa-arrow-left"></i>
        </button>
      </div>

      <!-- Selected Destination Display -->
      <div class="destination-display">
        <div class="destination-card">
          <i class="fas fa-map-marker-alt"></i>
          <div class="destination-info">
            <span class="label">{{ t.goingTo || 'Going to' }}</span>
            <p class="destination-name">{{ toLocation.name }}</p>
            <p class="destination-city">{{ toLocation.city }}</p>
          </div>
          <button class="change-btn" @click="backToDestination" title="Change destination">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </div>

      <!-- Nearest Bus Stops -->
      <div class="nearest-stops-list">
        <div v-if="isLoadingStops" class="loading-state">
          <div class="spinner-small"></div>
          <p>{{ t.loadingStops || 'Finding nearest stops...' }}</p>
        </div>

        <div v-else-if="nearestStops.length > 0" class="stops-container">
          <div 
            v-for="stop in nearestStops" 
            :key="stop.id"
            :class="['stop-card', { selected: selectedOriginStop?.id === stop.id }]"
            @click="selectOriginStop(stop)"
          >
            <div class="stop-header">
              <div class="stop-info">
                <div class="stop-icon" :class="stop.type">
                  <i class="fas fa-bus-alt"></i>
                </div>
                <div class="stop-details">
                  <p class="stop-name">{{ stop.name }}</p>
                  <p class="stop-area" v-if="stop.area">{{ stop.area }}</p>
                </div>
              </div>
              <div class="stop-distance">
                <span class="distance-value">{{ stop.distance.toFixed(2) }}</span>
                <span class="distance-unit">km</span>
              </div>
            </div>
            <div v-if="selectedOriginStop?.id === stop.id" class="stop-footer">
              <span class="selected-badge">
                <i class="fas fa-check"></i>
                {{ t.selected || 'Selected' }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="no-stops">
          <i class="fas fa-search"></i>
          <p>{{ t.noNearbyStops || 'No nearby stops found' }}</p>
        </div>
      </div>

      <!-- Continue Button -->
      <button 
        v-if="selectedOriginStop"
        class="continue-btn"
        @click="continueToJourney"
      >
        {{ t.continue || 'Continue' }}
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- Step 3: Journey Active -->
    <div v-else class="journey-active">
      <!-- Journey Header -->
      <div class="journey-header">
        <h3>{{ t.journeyDetails || 'Journey Details' }}</h3>
        <button class="clear-btn" @click="clearJourney" title="Clear journey">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Route Information -->
      <div class="route-info">
        <!-- From Location -->
        <div class="location-item from">
          <div class="location-icon">
            <i class="fas fa-map-pin"></i>
          </div>
          <div class="location-details">
            <span class="location-label">{{ t.from || 'From' }}</span>
            <p class="location-name">{{ selectedOriginStop.name }}</p>
            <p class="location-coords">{{ formatCoords(selectedOriginStop.coordinates) }}</p>
          </div>
        </div>

        <!-- Route Arrow -->
        <div class="route-arrow">
          <div class="arrow-line"></div>
          <i class="fas fa-arrow-down"></i>
        </div>

        <!-- To Location -->
        <div class="location-item to">
          <div class="location-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="location-details">
            <span class="location-label">{{ t.to || 'To' }}</span>
            <p class="location-name">{{ toLocation.name }}</p>
            <p class="location-coords">{{ formatCoords(toLocation.coordinates) }}</p>
          </div>
        </div>
      </div>

      <!-- Journey Metrics -->
      <div class="journey-metrics">
        <!-- Distance -->
        <div class="metric">
          <div class="metric-icon">
            <i class="fas fa-road"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t.distance || 'Distance' }}</span>
            <p class="metric-value">{{ journey.distance || '0' }} km</p>
          </div>
        </div>

        <!-- Estimated Time -->
        <div class="metric">
          <div class="metric-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t.estimatedTime || 'Est. Time' }}</span>
            <p class="metric-value">{{ journey.estimatedTime?.formatted || '0 mins' }}</p>
          </div>
        </div>

        <!-- Direction -->
        <div class="metric">
          <div class="metric-icon">
            <i class="fas fa-compass"></i>
          </div>
          <div class="metric-content">
            <span class="metric-label">{{ t.direction || 'Direction' }}</span>
            <p class="metric-value">{{ directionText }}</p>
          </div>
        </div>
      </div>

      <!-- Time Breakdown -->
      <div class="time-breakdown">
        <div class="breakdown-header">
          <span>{{ t.travelTime || 'Travel Time Estimates' }}</span>
        </div>

        <div class="breakdown-items">
          <!-- With Traffic -->
          <div class="breakdown-item with-traffic">
            <div class="breakdown-icon">
              <i class="fas fa-traffic-light"></i>
            </div>
            <div class="breakdown-details">
              <span class="breakdown-label">{{ t.withTraffic || 'With Traffic' }}</span>
              <p class="breakdown-time">~{{ journey.estimatedTime?.withTraffic || 0 }} minutes</p>
            </div>
          </div>

          <!-- Without Traffic -->
          <div class="breakdown-item without-traffic">
            <div class="breakdown-icon">
              <i class="fas fa-wind"></i>
            </div>
            <div class="breakdown-details">
              <span class="breakdown-label">{{ t.withoutTraffic || 'Free Flow' }}</span>
              <p class="breakdown-time">~{{ journey.estimatedTime?.withoutTraffic || 0 }} minutes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Journey Actions -->
      <div class="journey-actions">
        <button class="action-btn book-btn" @click="bookJourney">
          <i class="fas fa-ticket-alt"></i>
          {{ t.bookThisTrip || 'Book Journey' }}
        </button>
        <button class="action-btn reverse-btn" @click="reverseRoute">
          <i class="fas fa-exchange-alt"></i>
          {{ t.reverse || 'Reverse' }}
        </button>
      </div>

      <!-- Live Tracking Simulation -->
      <div v-if="isTracking" class="live-tracking">
        <div class="tracking-header">
          <span class="tracking-badge">
            <i class="fas fa-circle"></i>
            {{ t.tracking || 'Tracking' }}
          </span>
          <button class="stop-tracking-btn" @click="stopTracking">
            <i class="fas fa-stop-circle"></i>
          </button>
        </div>

        <div class="tracking-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: trackingProgress + '%' }"></div>
          </div>
          <p class="progress-text">{{ trackingProgress }}% complete</p>
        </div>

        <div class="tracking-info">
          <div class="info-item">
            <span>{{ t.elapsed || 'Elapsed' }}:</span>
            <strong>{{ formatTime(elapsedTime) }}</strong>
          </div>
          <div class="info-item">
            <span>{{ t.remaining || 'Remaining' }}:</span>
            <strong>{{ formatTime(remainingTime) }}</strong>
          </div>
        </div>
      </div>

      <!-- Start Tracking Button -->
      <div v-else class="tracking-control">
        <button class="start-tracking-btn" @click="startTracking">
          <i class="fas fa-play"></i>
          {{ t.startTracking || 'Start Tracking' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LocationPicker from './LocationPicker.vue'
import {
  getRouteInfo,
  bearingToDirection,
  formatCoordinates,
  findNearestStops
} from '../composables/useLocationUtils.js'

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const userLocation = computed(() => store.userLocation)

const fromLocation = ref(null)
const toLocation = ref(null)
const selectedOriginStop = ref(null)
const journey = ref(null)
const isTracking = ref(false)
const elapsedTime = ref(0)
const trackingProgress = ref(0)
const nearestStops = ref([])
const isLoadingStops = ref(false)

let trackingInterval = null

// Computed properties
const directionText = computed(() => {
  if (!journey.value) return '—'
  const bearing = journey.value.bearingDegrees
  return `${bearingToDirection(bearing)} (${Math.round(bearing)}°)`
})

const remainingTime = computed(() => {
  if (!journey.value) return 0
  return journey.value.estimatedTime.withTraffic - elapsedTime.value
})

const fromLocationDisplay = computed(() => {
  if (userLocation.value && userLocation.value.latitude) {
    return userLocation.value.address || `${userLocation.value.latitude.toFixed(4)}, ${userLocation.value.longitude.toFixed(4)}`
  }
  return 'Current Location'
})

// Format coordinates for display
const formatCoords = (coords) => {
  if (!coords) return 'N/A'
  return `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`
}

// Format time as MM:SS
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Select destination location
const selectDestination = (location) => {
  toLocation.value = location
  // Set from location from user's current location
  if (userLocation.value && userLocation.value.latitude) {
    fromLocation.value = {
      name: userLocation.value.address || 'My Location',
      coordinates: {
        lat: userLocation.value.latitude,
        lng: userLocation.value.longitude
      }
    }
  }
  // Find nearest bus stops to destination
  findNearestBusStops()
}

// Find nearest bus stops to destination
const findNearestBusStops = () => {
  if (!toLocation.value) return
  
  isLoadingStops.value = true
  
  // Simulate a small delay for realistic UX
  setTimeout(() => {
    const stops = findNearestStops(
      toLocation.value.coordinates.lat,
      toLocation.value.coordinates.lng,
      8 // Get 8 nearest stops
    )
    nearestStops.value = stops
    isLoadingStops.value = false
  }, 600)
}

// Select origin stop
const selectOriginStop = (stop) => {
  selectedOriginStop.value = stop
}

// Back to destination selection
const backToDestination = () => {
  selectedOriginStop.value = null
  nearestStops.value = []
}

// Back to initial selection
const backToSelection = () => {
  toLocation.value = null
  selectedOriginStop.value = null
  fromLocation.value = null
  nearestStops.value = []
}

// Continue to journey details
const continueToJourney = () => {
  if (!selectedOriginStop.value || !toLocation.value) return
  calculateJourney()
}

// Calculate journey info
const calculateJourney = () => {
  if (!selectedOriginStop.value || !toLocation.value) return

  journey.value = getRouteInfo(
    selectedOriginStop.value.coordinates.lat,
    selectedOriginStop.value.coordinates.lng,
    toLocation.value.coordinates.lat,
    toLocation.value.coordinates.lng,
    selectedOriginStop.value.name,
    toLocation.value.name
  )
}

// Clear journey
const clearJourney = () => {
  backToSelection()
  journey.value = null
  stopTracking()
}

// Reverse route
const reverseRoute = () => {
  const temp = selectedOriginStop.value
  selectedOriginStop.value = toLocation.value
  toLocation.value = temp
  calculateJourney()
  stopTracking()
}

// Start tracking
const startTracking = () => {
  isTracking.value = true
  elapsedTime.value = 0
  trackingProgress.value = 0

  trackingInterval = setInterval(() => {
    elapsedTime.value += 1
    
    // Calculate progress percentage
    if (journey.value && journey.value.estimatedTime.withTraffic > 0) {
      trackingProgress.value = Math.min(
        Math.round((elapsedTime.value / (journey.value.estimatedTime.withTraffic * 60)) * 100),
        100
      )
    }

    // End tracking when time is up
    if (elapsedTime.value >= (journey.value?.estimatedTime.withTraffic * 60 || 3600)) {
      stopTracking()
      // Show arrival notification
      store.showLocationNotification = {
        type: 'success',
        message: `You've arrived at ${toLocation.value.name}!`
      }
    }
  }, 1000)
}

// Stop tracking
const stopTracking = () => {
  if (trackingInterval) {
    clearInterval(trackingInterval)
  }
  isTracking.value = false
}

// Book journey function
const bookJourney = () => {
  // Set selected origin and destination in store
  store.selectedOriginStop = selectedOriginStop.value
  store.selectedDestinationStop = toLocation.value
  // Could navigate to booking page
  console.log('Booking journey:', journey.value)
}

onMounted(() => {
  // Make function available globally through store or expose
  store.setJourneyLocations = (from, to) => {
    fromLocation.value = from
    toLocation.value = to
    calculateJourney()
  }
})

onUnmounted(() => {
  stopTracking()
})
</script>

<style scoped>
.journey-tracker {
  width: 100%;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
}

/* Empty State */
.journey-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-tertiary);
}

.journey-empty i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.journey-empty p {
  margin: 0;
  font-size: 14px;
}

/* Active Journey */
.journey-active {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.journey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.journey-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.clear-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #FFE0B2;
  color: #E65100;
  border-color: #FF6F00;
}

/* Route Information */
.route-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.location-item {
  display: flex;
  gap: 12px;
  align-items: start;
}

.location-icon {
  width: 32px;
  height: 32px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E7D32;
  font-size: 14px;
  flex-shrink: 0;
}

.location-item.to .location-icon {
  background: #FFE0B2;
  color: #FF6F00;
}

.location-details {
  flex: 1;
  min-width: 0;
}

.location-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.location-name {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-word;
}

.location-coords {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: 'Courier New', monospace;
}

.route-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 0;
}

.arrow-line {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, #2E7D32);
}

.route-arrow i {
  color: #2E7D32;
  font-size: 18px;
}

/* Journey Metrics */
.journey-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.metric {
  display: flex;
  gap: 8px;
  align-items: start;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.metric-icon {
  width: 28px;
  height: 28px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E7D32;
  font-size: 14px;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.metric-value {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Time Breakdown */
.time-breakdown {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.breakdown-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  border-left: 3px solid #2E7D32;
}

.breakdown-item.without-traffic {
  border-left-color: #1976D2;
}

.breakdown-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #2E7D32;
  flex-shrink: 0;
}

.breakdown-item.without-traffic .breakdown-icon {
  color: #1976D2;
}

.breakdown-details {
  flex: 1;
}

.breakdown-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.breakdown-time {
  margin: 2px 0 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Journey Actions */
.journey-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:hover {
  background: var(--bg-secondary);
}

.book-btn {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
}

.book-btn:hover {
  background: #1B5E20;
  border-color: #1B5E20;
}

/* Live Tracking */
.live-tracking,
.tracking-control {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 6px;
  border: 1px solid #E8F5E9;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tracking-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2E7D32;
}

.tracking-badge i {
  font-size: 8px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.stop-tracking-btn {
  padding: 4px 8px;
  border: 1px solid #D32F2F;
  border-radius: 4px;
  background: transparent;
  color: #D32F2F;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stop-tracking-btn:hover {
  background: #FFEBEE;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2E7D32, #1B5E20);
  width: 0%;
  transition: width 0.3s ease;
}

.progress-text {
  margin: 0;
  font-size: 12px;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.tracking-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.info-item {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  background: var(--bg-primary);
  border-radius: 4px;
}

.info-item span {
  color: var(--text-secondary);
}

.info-item strong {
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

/* Start Tracking Button */
.tracking-control {
  display: flex;
  justify-content: center;
}

.start-tracking-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #2E7D32;
  color: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.start-tracking-btn:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(46, 125, 50, 0.3);
}

/* Responsive */
@media (max-width: 600px) {
  .journey-metrics {
    grid-template-columns: 1fr;
  }

  .journey-actions {
    flex-direction: column;
  }

  .tracking-info {
    flex-direction: column;
    gap: 8px;
  }
}

/* Step Selectors Styles */
.step-select-destination,
.step-view-destination {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
}

.step-number {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.step-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.step-header > div:not(.step-number) {
  flex: 1;
}

.step-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.back-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* Destination Picker */
.destination-picker-wrapper {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.from-location-section {
  padding: 12px;
  background: #E8F5E9;
  border-radius: 8px;
  border-left: 3px solid #2E7D32;
}

.from-location-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.from-location-section i {
  font-size: 20px;
  color: #2E7D32;
  flex-shrink: 0;
}

.from-location-section .location-details {
  flex: 1;
}

.from-location-section .label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #1B5E20;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.from-location-section .location-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1B5E20;
}

/* Destination Display */
.destination-display {
  padding: 12px 0;
}

.destination-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #FFF3E0;
  border-radius: 8px;
  border-left: 3px solid #FF6F00;
}

.destination-card i {
  font-size: 20px;
  color: #FF6F00;
  flex-shrink: 0;
}

.destination-info {
  flex: 1;
}

.destination-info .label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #E65100;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.destination-name {
  margin: 0 0 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #E65100;
}

.destination-city {
  margin: 0;
  font-size: 12px;
  color: #E65100;
  opacity: 0.8;
}

.change-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: white;
  color: #FF6F00;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.change-btn:hover {
  background: #FFE0B2;
  transform: scale(1.1);
}

/* Nearest Stops List */
.nearest-stops-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-secondary);
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stops-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.stops-container::-webkit-scrollbar {
  width: 6px;
}

.stops-container::-webkit-scrollbar-track {
  background: transparent;
}

.stops-container::-webkit-scrollbar-thumb {
  background: #BDBDBD;
  border-radius: 3px;
}

.stops-container::-webkit-scrollbar-thumb:hover {
  background: #999999;
}

/* Stop Card */
.stop-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.stop-card:hover {
  background: var(--bg-primary);
  border-color: #2E7D32;
  transform: translateX(4px);
}

.stop-card.selected {
  background: #E8F5E9;
  border-color: #2E7D32;
}

.stop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.stop-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.stop-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: #E8F5E9;
  color: #2E7D32;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stop-icon.roadside {
  background: #FFE0B2;
  color: #FF6F00;
}

.stop-icon.station {
  background: #E3F2FD;
  color: #1976D2;
}

.stop-details {
  flex: 1;
  min-width: 0;
}

.stop-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.stop-area {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.stop-distance {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: rgba(46, 125, 50, 0.1);
  border-radius: 6px;
}

.distance-value {
  font-size: 14px;
  font-weight: 600;
  color: #2E7D32;
}

.distance-unit {
  font-size: 11px;
  color: #2E7D32;
  font-weight: 500;
}

.stop-footer {
  display: flex;
  justify-content: center;
  padding-top: 8px;
  border-top: 1px solid #C8E6C9;
  margin-top: 8px;
}

.selected-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #2E7D32;
}

.selected-badge i {
  font-size: 14px;
}

.no-stops {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.no-stops i {
  font-size: 48px;
  opacity: 0.3;
}

/* Continue Button */
.continue-btn {
  padding: 12px 20px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  width: 100%;
}

.continue-btn:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.continue-btn:disabled {
  background: #BDBDBD;
  cursor: not-allowed;
  transform: none;
}

/* Mobile Responsive */
@media (max-width: 499px) {
  .step-header {
    flex-direction: row;
    align-items: center;
  }

  .stop-distance {
    flex-direction: row;
    gap: 4px;
  }

  .distance-unit {
    display: none;
  }

  .stops-container {
    max-height: 300px;
  }
}

/* Dark mode overrides */
html.dark .from-location-section { background: rgba(46,125,50,0.1); }
html.dark .from-location-section .label { color: #81C784; }
html.dark .from-location-section .location-name { color: #81C784; }
html.dark .destination-card { background: rgba(255,111,0,0.08); }
html.dark .destination-info .label { color: #FFB74D; }
html.dark .destination-name { color: #FFB74D; }
html.dark .destination-city { color: #FFB74D; }
html.dark .change-btn { background: var(--bg-tertiary); }
html.dark .change-btn:hover { background: rgba(255,224,178,0.15); }
html.dark .spinner-small { border-color: var(--border-color); border-top-color: #4CAF50; }
html.dark .stops-container::-webkit-scrollbar-thumb { background: var(--border-color); }
html.dark .stop-card.selected { background: rgba(46,125,50,0.1); }
html.dark .stop-icon { background: rgba(46,125,50,0.15); }
html.dark .stop-icon.roadside { background: rgba(255,111,0,0.15); }
html.dark .stop-icon.station { background: rgba(25,118,210,0.15); }
html.dark .stop-footer { border-color: var(--border-color); }
html.dark .stop-tracking-btn:hover { background: rgba(211,47,47,0.1); }
html.dark .live-tracking, html.dark .tracking-control { border-color: rgba(46,125,50,0.2); }
html.dark .continue-btn:disabled { background: var(--border-color); }
html.dark .step-number { background: var(--green); }
html.dark .stop-card:hover { border-color: var(--green); }
html.dark .stop-card.selected { border-color: var(--green); }
html.dark .book-btn { background: var(--green); border-color: var(--green); }
html.dark .book-btn:hover { background: #16a34a; border-color: #16a34a; }
html.dark .start-tracking-btn { background: var(--green); }
html.dark .start-tracking-btn:hover { background: #16a34a; }
html.dark .continue-btn { background: var(--green); }
html.dark .continue-btn:hover { background: #16a34a; }
html.dark .progress-fill { background: var(--green); }
html.dark .tracking-badge { color: var(--green); }
html.dark .selected-badge { color: var(--green); }
html.dark .distance-value { color: var(--green); }
html.dark .distance-unit { color: var(--green); }
</style>
