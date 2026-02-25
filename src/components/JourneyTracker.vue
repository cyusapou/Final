<template>
  <div class="journey-tracker">
    <!-- Journey Not Started -->
    <div v-if="!fromLocation || !toLocation" class="journey-empty">
      <i class="fas fa-route"></i>
      <p>{{ t.selectLocations || 'Select start and end locations to track journey' }}</p>
    </div>

    <!-- Journey Active -->
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
            <p class="location-name">{{ fromLocation.name }}</p>
            <p class="location-coords">{{ formatCoords(fromLocation.coordinates) }}</p>
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
import {
  getRouteInfo,
  bearingToDirection,
  formatCoordinates
} from '../composables/useLocationUtils.js'

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const fromLocation = ref(null)
const toLocation = ref(null)
const journey = ref(null)
const isTracking = ref(false)
const elapsedTime = ref(0)
const trackingProgress = ref(0)

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

// Set locations
const setLocations = (from, to) => {
  fromLocation.value = from
  toLocation.value = to
  calculateJourney()
}

// Calculate journey info
const calculateJourney = () => {
  if (!fromLocation.value || !toLocation.value) return

  journey.value = getRouteInfo(
    fromLocation.value.coordinates.lat,
    fromLocation.value.coordinates.lng,
    toLocation.value.coordinates.lat,
    toLocation.value.coordinates.lng,
    fromLocation.value.name,
    toLocation.value.name
  )
}

// Clear journey
const clearJourney = () => {
  fromLocation.value = null
  toLocation.value = null
  journey.value = null
  stopTracking()
}

// Reverse route
const reverseRoute = () => {
  const temp = fromLocation.value
  fromLocation.value = toLocation.value
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
  store.selectedOriginStop = fromLocation.value
  store.selectedDestinationStop = toLocation.value
  // Could navigate to booking page
  console.log('Booking journey:', journey.value)
}

// Expose function to set locations from parent
onMounted(() => {
  // Make function available globally through store or expose
  store.setJourneyLocations = setLocations
})

onUnmounted(() => {
  stopTracking()
})

// Watch for location selection from store
store.setJourneyLocations = setLocations
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
</style>
