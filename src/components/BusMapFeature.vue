<template>
  <div class="bus-map-feature">
    <!-- Map Container -->
    <div style="height: 500px; width: 100%;">
      <l-map
        ref="mapRef"
        :zoom="zoom"
        :center="mapCenter"
        :use-global-leaflet="false"
        @ready="onMapReady"
      >
        <!-- OpenStreetMap Tiles -->
        <l-tile-layer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          :attribution="attribution"
          layer-type="base"
        />

        <!-- Station Markers -->
        <StationMarkers
          :on-station-click="handleStationClick"
          :on-zoom-to-station="handleZoomToStation"
        />

        <!-- Bus Tracker -->
        <BusTracker
          :user-location="userLocation"
          :on-bus-track="handleBusTrack"
          :enable-simulation="enableSimulation"
        />

        <!-- Route Path -->
        <RoutePath
          :start-point="userLocation"
          :end-point="destinationStation"
          :distance="routeDistance"
          :show-route="showRoute"
        />

        <!-- User Location Marker (if separate from BusTracker) -->
        <l-marker
          v-if="userLocation && !showUserInBusTracker"
          :lat-lng="[userLocation.lat, userLocation.lng]"
          :icon="userIcon"
        >
          <l-popup>
            <div class="user-popup">
              <h4><i class="fas fa-map-marker-alt"></i> Your Location</h4>
              <p class="user-coords">{{ userLocation.lat.toFixed(4) }}, {{ userLocation.lng.toFixed(4) }}</p>
              <p v-if="userLocation.accuracy" class="user-accuracy">
                Accuracy: ±{{ Math.round(userLocation.accuracy) }}m
              </p>
              <p v-if="lastUpdateTime" class="update-time">
                Updated: {{ formatTime(lastUpdateTime) }}
              </p>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>

    <!-- Control Panel -->
    <div class="control-panel">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="Search for a station..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Search Results -->
        <div v-if="searchResults.length > 0" class="search-results">
          <div
            v-for="station in searchResults.slice(0, 5)"
            :key="station.id"
            class="search-result-item"
            @click="handleStationSelect(station)"
          >
            <div class="result-info">
              <h4>{{ station.name }}</h4>
              <p>{{ station.area }} • {{ station.description }}</p>
            </div>
            <button class="go-to-station-btn">
              <i class="fas fa-map-marker-alt"></i>
            </button>
          </div>
        </div>
        
        <div v-else-if="searchQuery && searchResults.length === 0" class="no-results">
          <p>No stations found for "{{ searchQuery }}"</p>
        </div>
      </div>

      <div class="controls">
        <!-- Real-time Tracking Status -->
        <div v-if="isTracking" class="tracking-status">
          <span class="tracking-indicator"><i class="fas fa-circle" style="color: #28a745;"></i></span>
          <span class="tracking-text">Live Tracking ({{ routeDistance.toFixed(2) }}km to destination)</span>
        </div>

        <!-- Button Grid -->
        <div class="button-grid">
          <!-- Find Nearest Station Button -->
          <button
            class="control-btn nearest-btn"
            @click="handleFindNearestStation"
            :disabled="nearestLoading"
          >
            <span v-if="!nearestLoading"><i class="fas fa-map-marker-alt"></i> Find Station</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Finding...</span>
          </button>

          <!-- Center on User Location -->
          <button
            v-if="userLocation"
            class="control-btn center-btn"
            @click="centerOnUser"
          >
            <i class="fas fa-crosshairs"></i> Center
          </button>

          <!-- Clear Route Button -->
          <button
            v-if="showRoute"
            class="control-btn clear-route-btn"
            @click="clearRoute"
          >
            <i class="fas fa-trash-alt"></i> Clear
          </button>

          <!-- Toggle Bus Simulation -->
          <button
            class="control-btn simulation-btn"
            @click="toggleSimulation"
            :class="{ active: enableSimulation }"
          >
            <i :class="enableSimulation ? 'fas fa-pause' : 'fas fa-play'"></i>
            {{ enableSimulation ? 'Pause' : 'Resume' }}
          </button>

          <!-- Reset View -->
          <button
            class="control-btn reset-btn"
            @click="resetView"
          >
            <i class="fas fa-sync-alt"></i> Reset
          </button>
        </div>
      </div>

      <!-- Info Display -->
      <div v-if="nearestResult" class="info-display">
        <div class="nearest-info" :class="{ error: nearestResult.error }">
          <h4><i class="fas fa-map-marker-alt"></i> Nearest Station Result</h4>
          <div v-if="nearestResult.station && !nearestResult.error">
            <p class="station-name">{{ nearestResult.station.name }}</p>
            <p class="station-distance">{{ nearestResult.distance.toFixed(2) }} km away</p>
            <p class="station-area" v-if="nearestResult.station.area">
              <i class="fas fa-map-marker-alt"></i> {{ nearestResult.station.area }}
            </p>
            <button
              class="zoom-to-btn"
              @click="handleZoomToStation(nearestResult.station)"
            >
              <i class="fas fa-search-location"></i> Zoom to Station
            </button>
          </div>
          <div v-else-if="nearestResult.error">
            <p class="error-message"><i class="fas fa-exclamation-circle"></i> {{ nearestResult.error }}</p>
          </div>
        </div>
      </div>

      <!-- Selected Station Info -->
      <div v-if="selectedStation" class="selected-station">
        <h4><i class="fas fa-bus"></i> Selected Station</h4>
        <p class="station-name">{{ selectedStation.name }}</p>
        <p class="station-type">{{ selectedStation.type === 'station' ? 'Bus Station' : 'Bus Stop' }}</p>
        <p v-if="selectedStation.area" class="station-area"><i class="fas fa-map-marker-alt"></i> {{ selectedStation.area }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { Icon, type Map } from 'leaflet'
import { useNearestStation, type UserLocation } from '../composables/useNearestStation'
import { type Station, searchStations } from '../data/stations'
import StationMarkers from './StationMarkers.vue'
import BusTracker from './BusTracker.vue'
import RoutePath from './RoutePath.vue'

// Reactive state
const mapRef = ref<typeof LMap | null>(null)
const mapInstance = ref<Map | null>(null)
const zoom = ref(12)
const mapCenter = ref([-1.9536, 30.0606]) // Kigali center
const userLocation = ref<UserLocation | null>(null)
const selectedStation = ref<Station | null>(null)
const enableSimulation = ref(true)

// Search functionality
const searchQuery = ref('')
const searchResults = ref<Station[]>([])

// Route functionality
const destinationStation = ref<Station | null>(null)
const showRoute = ref(false)
const routeDistance = ref<number>(0)

// Nearest station functionality
const {
  isLoading: nearestLoading,
  error: nearestError,
  getNearestStation,
  startRealTimeTracking,
  stopRealTimeTracking,
  isTracking,
  lastUpdateTime
} = useNearestStation()

const nearestResult = ref<{
  station: Station | null
  distance: number | null
  error: string | null
} | null>(null)

// Attribution for OpenStreetMap (required by OSM Tile Usage Policy)
const attribution = "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"

// Fix for default Leaflet marker icons
const fixLeafletIcon = () => {
  delete (Icon.Default.prototype as any)._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Custom user location icon (red)
const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Whether to show user location in BusTracker component
const showUserInBusTracker = computed(() => true)

// Map initialization
const onMapReady = (map: Map) => {
  mapInstance.value = map
  console.log('Bus map ready')
}

// Handle station marker click
const handleStationClick = (station: Station) => {
  selectedStation.value = station
  console.log('Station clicked:', station.name)
}

// Search functionality
const handleSearch = () => {
  if (searchQuery.value.trim() === '') {
    searchResults.value = []
    return
  }
  
  searchResults.value = searchStations(searchQuery.value)
  console.log('Search results:', searchResults.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const handleStationSelect = (station: Station) => {
  // Set up route to this station
  destinationStation.value = station
  showRoute.value = true
  
  // Calculate distance if we have user location
  if (userLocation.value) {
    const distance = calculateDistance(userLocation.value, station)
    routeDistance.value = distance
  }
  
  // Zoom to station
  handleZoomToStation(station)
  clearSearch()
  selectedStation.value = station
  console.log('Route set to station:', station.name, 'Distance:', routeDistance.value.toFixed(2), 'km')
}

// Calculate distance between two points
const calculateDistance = (from: UserLocation, to: Station): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (to.lat - from.lat) * Math.PI / 180
  const dLng = (to.lng - from.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Format time for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Start real-time tracking when user location is available
const startTrackingIfLocationAvailable = () => {
  if (userLocation.value && !isTracking.value) {
    startRealTimeTracking((location) => {
      // Update route distance when location changes
      if (destinationStation.value) {
        routeDistance.value = calculateDistance(location, destinationStation.value)
      }
    })
  }
}

// Zoom to specific station
const handleZoomToStation = (station: Station) => {
  if (mapInstance.value) {
    mapInstance.value.setView([station.lat, station.lng], 16)
    selectedStation.value = station
  }
}

// Handle bus tracking
const handleBusTrack = (bus: any) => {
  console.log('Tracking bus:', bus.id)
  // Could implement more detailed bus tracking here
}

// Find nearest station
const handleFindNearestStation = async () => {
  try {
    const result = await getNearestStation()
    nearestResult.value = result
    
    if (result.station && !result.error) {
      // Auto-zoom to nearest station
      handleZoomToStation(result.station)
      userLocation.value = result.userLocation || null
      
      // Start real-time tracking
      startTrackingIfLocationAvailable()
      
      // Set up route to nearest station
      destinationStation.value = result.station
      showRoute.value = true
      routeDistance.value = result.distance || 0
    }
  } catch (error) {
    console.error('Error finding nearest station:', error)
    nearestResult.value = {
      station: null,
      distance: null,
      error: 'Failed to find nearest station'
    }
  }
}

// Center map on user location
const centerOnUser = () => {
  if (userLocation.value && mapInstance.value) {
    mapInstance.value.setView([userLocation.value.lat, userLocation.value.lng], 15)
  }
}

// Toggle bus simulation
const toggleSimulation = () => {
  enableSimulation.value = !enableSimulation.value
}

// Reset map view to default
const resetView = () => {
  if (mapInstance.value) {
    mapInstance.value.setView(mapCenter.value, zoom.value)
    selectedStation.value = null
    nearestResult.value = null
  }
}

// Clear route method
const clearRoute = () => {
  showRoute.value = false
  destinationStation.value = null
  routeDistance.value = 0
  console.log('Route cleared')
}

// Lifecycle hooks
onMounted(() => {
  fixLeafletIcon()
  // Start real-time tracking if user location is already available
  startTrackingIfLocationAvailable()
})

onUnmounted(() => {
  // Clean up real-time tracking
  try {
    stopRealTimeTracking()
  } catch (err) {
    console.warn('Error stopping real-time tracking:', err)
  }
  
  // Clean up store intervals
  if (store.trackingIntervalId) {
    clearInterval(store.trackingIntervalId)
    store.trackingIntervalId = null
  }
})

// Expose methods for parent component
defineExpose({
  handleFindNearestStation,
  centerOnUser,
  resetView,
  toggleSimulation,
  mapInstance: computed(() => mapInstance.value),
  selectedStation: computed(() => selectedStation.value),
  userLocation: computed(() => userLocation.value),
  destinationStation: computed(() => destinationStation.value),
  routeDistance: computed(() => routeDistance.value),
  isTracking: computed(() => isTracking.value),
  clearRoute: () => {
    showRoute.value = false
    destinationStation.value = null
    routeDistance.value = 0
  }
})
</script>

<style scoped>
.bus-map-feature {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

/* Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #1976D2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background 0.2s;
}

.clear-search-btn:hover {
  background: #5a6268;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: #f8f9fa;
}

.search-result-item:last-child {
  border-bottom: none;
}

.result-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.result-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.go-to-station-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #1976D2;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.2s;
}

.go-to-station-btn:hover {
  background: #1565C0;
}

.no-results {
  padding: 16px;
  text-align: center;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.button-grid .control-btn {
  justify-content: center;
  padding: 10px 12px;
  font-size: 12px;
}

.button-grid .control-btn i {
  font-size: 12px;
}

.tracking-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e8f5e8;
  border: 1px solid #4caf50;
  border-radius: 6px;
  font-size: 12px;
  color: #2e7d32;
  font-weight: 500;
}

.tracking-indicator {
  font-size: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.tracking-text {
  flex: 1;
}

.control-btn {
  padding: 10px 18px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.control-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.control-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nearest-btn {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
  box-shadow: 0 2px 4px rgba(46, 125, 50, 0.3);
}

.nearest-btn:hover:not(:disabled) {
  background: #1B5E20;
  border-color: #1B5E20;
  box-shadow: 0 4px 8px rgba(46, 125, 50, 0.4);
}

.center-btn {
  background: #1976D2;
  color: white;
  border-color: #1976D2;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.center-btn:hover:not(:disabled) {
  background: #1565C0;
  border-color: #1565C0;
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.4);
}

.simulation-btn.active {
  background: #FF6F00;
  color: white;
  border-color: #FF6F00;
  box-shadow: 0 2px 4px rgba(255, 111, 0, 0.3);
}

.reset-btn {
  background: #6c757d;
  color: white;
  border-color: #6c757d;
  box-shadow: 0 2px 4px rgba(108, 117, 125, 0.3);
}

.reset-btn:hover:not(:disabled) {
  background: #5a6268;
  border-color: #5a6268;
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.4);
}

.clear-route-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.clear-route-btn:hover:not(:disabled) {
  background: #c82333;
  border-color: #c82333;
}

.info-display {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.nearest-info {
  text-align: center;
}

.nearest-info.error {
  color: #dc3545;
}

.nearest-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2E7D32;
}

.nearest-info.error h4 {
  color: #dc3545;
}

.station-name {
  margin: 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.station-distance {
  margin: 2px 0;
  font-size: 13px;
  color: #666;
}

.station-area {
  margin: 2px 0;
  font-size: 12px;
  color: #1976D2;
}

.zoom-to-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #2E7D32;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.zoom-to-btn:hover {
  background: #1B5E20;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
}

.selected-station {
  padding: 12px;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #bbdefb;
  text-align: center;
}

.selected-station h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1976D2;
}

.selected-station .station-name {
  color: #1976D2;
}

.selected-station .station-type {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

/* Responsive Design */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .button-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .button-grid .control-btn {
    padding: 8px 10px;
    font-size: 11px;
  }
  
  .control-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .button-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .control-panel {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .control-btn {
    background: #4a5568;
    color: #e2e8f0;
    border-color: #718096;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .control-btn:hover:not(:disabled) {
    background: #718096;
    border-color: #a0aec0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  .nearest-btn {
    background: #38a169;
    border-color: #38a169;
    box-shadow: 0 2px 4px rgba(56, 161, 105, 0.3);
  }
  
  .nearest-btn:hover:not(:disabled) {
    background: #2f855a;
    border-color: #2f855a;
    box-shadow: 0 4px 8px rgba(56, 161, 105, 0.4);
  }
  
  .center-btn {
    background: #3182ce;
    border-color: #3182ce;
    box-shadow: 0 2px 4px rgba(49, 130, 206, 0.3);
  }
  
  .center-btn:hover:not(:disabled) {
    background: #2b6cb0;
    border-color: #2b6cb0;
    box-shadow: 0 4px 8px rgba(49, 130, 206, 0.4);
  }
  
  .info-display {
    background: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
  
  .selected-station {
    background: #2c5282;
    border-color: #2b6cb0;
    color: #e2e8f0;
  }
}
</style>
