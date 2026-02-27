<template>
  <Teleport to="body">
    <div v-if="showModal" class="location-modal-overlay" @click.self="closeModal">
      <div class="location-modal" :class="{ 'expanded': activeTab !== 'details' }">
        <!-- Header -->
        <div class="modal-header">
          <h2>{{ t.track }}</h2>
          <div class="header-tabs">
            <button 
              :class="['tab-btn', { active: activeTab === 'details' }]" 
              @click="activeTab = 'details'"
              title="Location Details"
            >
              <i class="fas fa-info-circle"></i>
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'map' }]" 
              @click="activeTab = 'map'"
              title="Map View"
            >
              <i class="fas fa-map"></i>
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'picker' }]" 
              @click="activeTab = 'picker'"
              title="Choose Location"
            >
              <i class="fas fa-location-dot"></i>
            </button>
            <button 
              :class="['tab-btn', { active: activeTab === 'journey' }]" 
              @click="activeTab = 'journey'"
              title="Track Journey"
            >
              <i class="fas fa-route"></i>
            </button>
          </div>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>{{ t.fetchingLocation || 'Fetching your location...' }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <p class="error-message">{{ error }}</p>
            <button class="retry-btn" @click="handleGetLocation">
              <i class="fas fa-redo"></i> {{ t.retry || 'Retry' }}
            </button>
          </div>

          <!-- Details Tab -->
          <div v-else-if="activeTab === 'details'" class="tab-content">
            <!-- Quick Track Actions -->
            <div class="quick-track-section">
              <h3>{{ t.realTimeBusTracking || 'Real-time Bus Tracking' }}</h3>
              <p class="track-instruction">{{ t.tapToTrackBus || 'Tap to track bus in real-time' }}</p>
              
              <div class="track-buttons">
                <button 
                  class="track-btn track-location-btn" 
                  @click="handleTrackLocation"
                  :disabled="isTracking"
                >
                  <i class="fas fa-crosshairs"></i>
                  <span>{{ t.trackLocation || 'Track Location' }}</span>
                </button>
                
                <button 
                  v-if="nearestStation"
                  class="track-btn track-bus-btn" 
                  @click="handleTrackBus"
                  :disabled="isTrackingBus"
                >
                  <i class="fas fa-bus"></i>
                  <span>{{ isTrackingBus ? (t.trackingBus || 'Tracking...') : (t.trackBusRealTime || 'Track Bus') }}</span>
                </button>
              </div>
              
              <!-- Nearest Station Info -->
              <div v-if="nearestStation" class="nearest-station-card">
                <div class="station-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="station-info">
                  <span class="station-label">{{ t.nearestStationFound || 'Nearest Station Found!' }}</span>
                  <p class="station-name">{{ nearestStation.name }}</p>
                  <p class="station-distance">{{ nearestStation.distance.toFixed(2) }} km away</p>
                </div>
              </div>
              
              <!-- Bus Location Display -->
              <div v-if="store.busLocation.latitude" class="bus-location-card">
                <div class="bus-icon">
                  <i class="fas fa-bus"></i>
                </div>
                <div class="bus-info">
                  <span class="bus-label">{{ t.busLocation || 'Bus Location' }}</span>
                  <p class="bus-coords">
                    {{ store.busLocation.latitude.toFixed(4) }}, {{ store.busLocation.longitude.toFixed(4) }}
                  </p>
                  <p class="bus-time" v-if="store.busLocation.lastUpdated">
                    {{ t.lastUpdated || 'Last Updated' }}: {{ formatTime(store.busLocation.lastUpdated) }}
                  </p>
                  <p v-if="store.busLocation.progress" class="bus-progress">
                    <i class="fas fa-hourglass-half"></i> {{ store.busLocation.progress }}% en route
                  </p>
                  <p v-if="store.busLocation.status === 'arrived'" class="bus-arrived">
                    <i class="fas fa-check-circle"></i> Bus Arrived!
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Tracked Coordinates Section -->
            <div v-if="store.coordinates.length > 0" class="coordinates-section">
              <h3>📍 {{ t.trackedStations || 'Tracked Stations' }}</h3>
              <div class="coordinates-list">
                <div v-for="(coordinate, index) in store.coordinates" :key="index" class="coordinate-item">
                  <div class="coord-icon">
                    <i :class="coordinate.type === 'station' ? 'fas fa-building' : 'fas fa-map-pin'"></i>
                  </div>
                  <div class="coord-info">
                    <p class="coord-name">{{ coordinate.name }}</p>
                    <p class="coord-coords">
                      <code>{{ coordinate.lat.toFixed(4) }}, {{ coordinate.lng.toFixed(4) }}</code>
                    </p>
                    <p class="coord-type">{{ coordinate.area || coordinate.type }}</p>
                  </div>
                  <button 
                    class="remove-coord-btn" 
                    @click="removeCoordinate(index)"
                    title="Remove coordinate"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="userLocation && userLocation.latitude" class="location-display">
              <div class="location-success">
                <div class="success-icon">
                  <i class="fas fa-map-pin"></i>
                </div>
                <p class="success-text">{{ t.locationFound || 'Location Found!' }}</p>
              </div>

              <!-- Location Details -->
              <div class="location-details">
                <div class="detail-item">
                  <label>{{ t.address || 'Address' }}</label>
                  <p class="detail-value">{{ userLocation.address || 'Rwanda' }}</p>
                </div>

                <div class="detail-item">
                  <label>{{ t.coordinates || 'Coordinates' }}</label>
                  <p class="detail-value coordinates">
                    <span class="lat">{{ userLocation.latitude.toFixed(4) }}</span>
                    <span class="separator">,</span>
                    <span class="lng">{{ userLocation.longitude.toFixed(4) }}</span>
                  </p>
                </div>

                <div class="detail-item">
                  <label>{{ t.accuracy || 'Accuracy' }}</label>
                  <p class="detail-value">±{{ Math.round(userLocation.accuracy) }}m</p>
                </div>

                <div class="detail-item">
                  <label>{{ t.time || 'Time' }}</label>
                  <p class="detail-value">{{ formatTime(userLocation.timestamp) }}</p>
                </div>
              </div>

              <!-- Nearest Bus Stops -->
              <div class="nearest-stops">
                <h4>{{ t.nearestStops || 'Nearest Bus Stops' }}</h4>
                <div class="stops-list">
                  <div 
                    v-for="stop in nearestStops" 
                    :key="stop.id"
                    class="stop-item"
                    @click="selectStop(stop)"
                  >
                    <div class="stop-marker">
                      <i class="fas fa-bus"></i>
                    </div>
                    <div class="stop-info">
                      <p class="stop-name">{{ stop.name }}</p>
                      <p class="stop-distance">{{ stop.distance.toFixed(2) }} km away</p>
                      <p class="stop-type">{{ stop.type === 'station' ? 'Bus Station' : 'Road Stop' }}</p>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                  </div>
                </div>
              </div>

              <!-- Quick Copy -->
              <div class="quick-actions">
                <button class="action-btn" @click="copyCoordinates">
                  <i class="fas fa-copy"></i> {{ t.copyCoordinates || 'Copy' }}
                </button>
              </div>
            </div>

            <div v-else class="initial-state">
              <div class="info-icon">
                <i class="fas fa-info-circle"></i>
              </div>
              <p>{{ t.clickToGetLocation || 'Click the button below to access your current location' }}</p>
            </div>
          </div>

          <!-- Map Tab -->
          <div v-else-if="activeTab === 'map' && userLocation && userLocation.latitude" class="tab-content map-tab">
            <LocationMap />
          </div>

          <!-- Location Picker Tab -->
          <div v-else-if="activeTab === 'picker'" class="tab-content picker-tab">
            <LocationPicker 
              mode="destination"
              :placeholder="t.whereGettingOff"
              @destination-selected="onLocationSelected"
              @close="activeTab = 'details'"
            />
          </div>

          <!-- Journey Tab -->
          <div v-else-if="activeTab === 'journey' && userLocation && userLocation.latitude" class="tab-content journey-tab">
            <JourneyTracker ref="journeyTrackerRef" />
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button 
            v-if="!isLoading && activeTab === 'details'" 
            class="btn btn-primary" 
            @click="handleGetLocation"
          >
            <i class="fas fa-location-arrow"></i>
            {{ userLocation && userLocation.latitude ? (t.refreshLocation || 'Refresh') : (t.getMyLocation || 'Get Location') }}
          </button>
          <button class="btn btn-secondary" @click="closeModal">
            {{ t.close || 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, coordinates } from '../store/index.js'
import { useLocation } from '../composables/useLocation.js'
import { translations } from '../translations/index.js'
import { findNearestStops } from '../composables/useLocationUtils.js'
import LocationMap from './LocationMap.vue'
import LocationPicker from './LocationPicker.vue'
import JourneyTracker from './JourneyTracker.vue'

const { isLoading, error, userLocation, getCurrentLocation } = useLocation()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const showModal = computed({
  get: () => store.showLocationModal,
  set: (val) => {
    store.showLocationModal = val
  }
})

const activeTab = ref('details')
const journeyTrackerRef = ref(null)
const nearestStops = ref([])
const nearestStation = ref(null)
const isTracking = ref(false)
const isTrackingBus = ref(false)

// Close modal
const closeModal = () => {
  store.showLocationModal = false
}

// Handle Track Location - instantaneously tracks location and finds nearest station
const handleTrackLocation = async () => {
  isTracking.value = true
  try {
    await getCurrentLocation()
    if (userLocation.value && userLocation.value.latitude) {
      // Find nearest stops
      const stops = findNearestStops(
        userLocation.value.latitude,
        userLocation.value.longitude,
        5
      )
      nearestStops.value = stops
      
      // Store nearest station coordinates
      if (stops.length > 0) {
        const station = stops[0]
        nearestStation.value = station
        
        // Get or calculate coordinates for the station
        const stationLat = station.coordinates?.lat || station.latitude || -1.9473
        const stationLng = station.coordinates?.lng || station.longitude || 30.0567
        
        // Add/Update coordinates in the coordinates array
        const existingIndex = store.coordinates.findIndex(c => c.name === station.name)
        if (existingIndex === -1) {
          // Add new station to coordinates
          store.coordinates.push({
            name: station.name,
            lat: stationLat,
            lng: stationLng,
            id: station.id,
            type: station.type,
            area: station.area || null
          })
        } else {
          // Update existing station
          store.coordinates[existingIndex] = {
            name: station.name,
            lat: stationLat,
            lng: stationLng,
            id: station.id,
            type: station.type,
            area: station.area || null
          }
        }
        
        console.log('✅ Tracked Location & Nearest Station:', {
          userLocation: {
            lat: userLocation.value.latitude,
            lng: userLocation.value.longitude
          },
          nearestStation: {
            name: station.name,
            lat: stationLat,
            lng: stationLng
          },
          allCoordinates: store.coordinates
        })
      }
    }
  } catch (err) {
    console.error('Location error:', err)
  } finally {
    isTracking.value = false
  }
}

// Handle Track Bus - real-time bus tracking
const handleTrackBus = () => {
  if (isTrackingBus.value) {
    // Stop tracking
    if (store.trackingIntervalId) {
      clearInterval(store.trackingIntervalId)
      store.trackingIntervalId = null
    }
    store.isTrackingBus = false
    store.busLocation = { latitude: null, longitude: null, lastUpdated: null }
    isTrackingBus.value = false
    console.log('🛑 Bus Tracking Stopped')
  } else {
    // Start real-time tracking
    if (!nearestStation.value || !userLocation.value) {
      alert('Please track location first to enable bus tracking')
      return
    }
    
    store.isTrackingBus = true
    isTrackingBus.value = true
    
    let progress = 0
    
    // Real-time bus location updates
    store.trackingIntervalId = setInterval(() => {
      if (nearestStation.value && userLocation.value) {
        // Smoothly move bus towards station
        progress += 0.05 // 5% closer each update (completes in ~60 seconds)
        
        if (progress >= 1) {
          // Bus reached the station
          store.busLocation = {
            latitude: nearestStation.value.coordinates?.lat || nearestStation.value.latitude || -1.9473,
            longitude: nearestStation.value.coordinates?.lng || nearestStation.value.longitude || 30.0567,
            lastUpdated: new Date(),
            status: 'arrived'
          }
          
          // Stop tracking when arrived
          clearInterval(store.trackingIntervalId)
          store.trackingIntervalId = null
          store.isTrackingBus = false
          isTrackingBus.value = false
          
          console.log('🚌 Bus Arrived at Station!')
          alert(`Bus arrived at ${nearestStation.value.name}!`)
        } else {
          // Bus is en route
          const stationLat = nearestStation.value.coordinates?.lat || nearestStation.value.latitude || -1.9473
          const stationLng = nearestStation.value.coordinates?.lng || nearestStation.value.longitude || 30.0567
          
          const busLat = userLocation.value.latitude + (stationLat - userLocation.value.latitude) * progress
          const busLng = userLocation.value.longitude + (stationLng - userLocation.value.longitude) * progress
          
          store.busLocation = {
            latitude: busLat,
            longitude: busLng,
            lastUpdated: new Date(),
            progress: Math.round(progress * 100),
            status: 'in_transit'
          }
        }
      }
    }, 2000) // Update every 2 seconds for smoother tracking
    
    console.log('🚌 Bus Tracking Started - User to Station')
  }
}

// Get location
const handleGetLocation = async () => {
  try {
    await getCurrentLocation()
    // Fetch nearest stops after getting location
    if (userLocation.value && userLocation.value.latitude) {
      nearestStops.value = findNearestStops(
        userLocation.value.latitude,
        userLocation.value.longitude,
        5
      )
    }
  } catch (err) {
    console.error('Location error:', err)
  }
}

// Copy coordinates to clipboard
const copyCoordinates = () => {
  if (userLocation.value && userLocation.value.latitude) {
    const coords = `${userLocation.value.latitude.toFixed(4)}, ${userLocation.value.longitude.toFixed(4)}`
    navigator.clipboard.writeText(coords).then(() => {
      const btn = document.querySelector('.action-btn')
      if (btn) {
        const originalHTML = btn.innerHTML
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!'
        setTimeout(() => {
          btn.innerHTML = originalHTML
        }, 2000)
      }
    })
  }
}

// Select a bus stop
const selectStop = (stop) => {
  store.selectedOriginStop = stop
  store.showLocationModal = false
  console.log('Selected origin stop:', stop)
}

// Remove coordinate from tracked list
const removeCoordinate = (index) => {
  const removed = store.coordinates.splice(index, 1)
  console.log('Removed coordinate:', removed[0])
}

// Handle location selection from picker
const onLocationSelected = (eventData) => {
  const { stop, location } = eventData
  
  // Store the selected destination
  store.selectedDestinationStop = stop
  store.selectedDestination = location
  
  console.log('Location selected:', stop)
  console.log('Location details:', location)
}

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.location-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.location-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: #2E7D32;
  border-color: #2E7D32;
  color: white;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #FFE0B2;
  color: #E65100;
}

.location-modal.expanded {
  max-width: 90vw;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: flex-start;
  align-items: stretch;
  text-align: left;
  width: 100%;
}

.map-tab {
  height: 500px;
  padding: 0;
}

.map-tab :deep(.location-map-container) {
  height: 100%;
  border-radius: 0;
}

.journey-tab {
  min-height: 400px;
}

.picker-tab {
  min-height: 400px;
  padding: 0;
}

.picker-tab :deep(.location-picker) {
  padding: 0;
  height: 100%;
}

/* Quick Track Section */
.quick-track-section {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.quick-track-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1B5E20;
}

.track-instruction {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #2E7D32;
}

.track-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.track-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.track-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.track-location-btn {
  background: #1976D2;
  color: white;
}

.track-location-btn:hover:not(:disabled) {
  background: #1565C0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.track-bus-btn {
  background: #FF6F00;
  color: white;
}

.track-bus-btn:hover:not(:disabled) {
  background: #F57C00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
}

/* Nearest Station Card */
.nearest-station-card {
  display: flex;
  gap: 12px;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  border-left: 4px solid #2E7D32;
}

.station-icon {
  width: 40px;
  height: 40px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E7D32;
  font-size: 18px;
}

.station-info {
  flex: 1;
}

.station-label {
  font-size: 11px;
  font-weight: 600;
  color: #2E7D32;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.station-name {
  margin: 4px 0 0 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.station-distance {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Bus Location Card */
.bus-location-card {
  display: flex;
  gap: 12px;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  border-left: 4px solid #FF6F00;
}

.bus-icon {
  width: 40px;
  height: 40px;
  background: #FFF3E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF6F00;
  font-size: 18px;
}

.bus-info {
  flex: 1;
}

.bus-label {
  font-size: 11px;
  font-weight: 600;
  color: #FF6F00;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bus-coords {
  margin: 4px 0 0 0;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
}

.bus-time {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: var(--text-secondary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--bg-secondary);
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-tertiary);
  font-size: 14px;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 48px;
  color: #D32F2F;
}

.error-message {
  color: #D32F2F;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #D32F2F;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #B71C1C;
}

/* Success State */
.location-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #2E7D32;
}

.success-text {
  font-size: 16px;
  font-weight: 600;
  color: #2E7D32;
  margin: 0;
}

.location-details {
  width: 100%;
  text-align: left;
  margin: 24px 0;
}

.detail-item {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.detail-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.detail-value {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-word;
}

.coordinates {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.coordinates .lat::after {
  content: '°N';
  font-size: 10px;
}

.coordinates .lng::after {
  content: '°E';
  font-size: 10px;
}

/* Nearest Stops */
.nearest-stops {
  margin-top: 24px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.nearest-stops h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stops-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stop-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid #FF6F00;
}

.stop-item:hover {
  background: #E8F5E9;
  border-left-color: #2E7D32;
  transform: translateX(2px);
}

.stop-marker {
  width: 32px;
  height: 32px;
  background: #FF6F00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  flex-shrink: 0;
}

.stop-info {
  flex: 1;
  min-width: 0;
}

.stop-name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.stop-distance {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stop-type {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stop-item i:last-of-type {
  color: var(--text-tertiary);
  font-size: 14px;
}

/* Initial State */
.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.info-icon {
  font-size: 48px;
  color: #1976D2;
}

.initial-state p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 20px 0;
}

.action-btn {
  padding: 8px 12px;
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
  gap: 6px;
}

.action-btn:hover {
  background: #E8F5E9;
  border-color: #2E7D32;
  color: #2E7D32;
}

/* Footer */
.modal-footer {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #2E7D32;
  color: white;
}

.btn-primary:hover {
  background: #1B5E20;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--border-color);
}

/* Tracked Coordinates Section */
.coordinates-section {
  background: linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.coordinates-section h3 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #7B1FA2;
}

.coordinates-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coordinate-item {
  display: flex;
  gap: 12px;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #7B1FA2;
  transition: all 0.2s;
}

.coordinate-item:hover {
  box-shadow: 0 2px 8px rgba(123, 31, 162, 0.15);
}

.coord-icon {
  width: 36px;
  height: 36px;
  background: #F3E5F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7B1FA2;
  font-size: 16px;
  flex-shrink: 0;
}

.coord-info {
  flex: 1;
  min-width: 0;
}

.coord-name {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.coord-coords {
  margin: 2px 0;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.coord-coords code {
  background: #F5F5F5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.coord-type {
  margin: 2px 0 0 0;
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.remove-coord-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #FFEBEE;
  color: #D32F2F;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-coord-btn:hover {
  background: #FFCDD2;
  transform: scale(1.05);
}

/* Bus Tracking Progress */
.bus-progress {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #FF6F00;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.bus-arrived {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #2E7D32;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
