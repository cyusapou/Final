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
import { store } from '../store/index.js'
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

// Close modal
const closeModal = () => {
  store.showLocationModal = false
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

.location-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transition: max-width 0.3s ease;
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

/* Dark Mode */
:root.dark-mode .location-modal-overlay {
  background: rgba(0, 0, 0, 0.8);
}

:root.dark-mode .close-btn:hover {
  background: rgba(230, 81, 0, 0.2);
}

:root.dark-mode .action-btn:hover {
  background: rgba(46, 125, 50, 0.2);
}
</style>
