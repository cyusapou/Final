<template>
  <div class="location-map-container">
    <!-- Map Container -->
    <div class="map-wrapper">
      <div ref="mapContainer" class="map"></div>
      
      <!-- Map Loading -->
      <div v-if="isLoading" class="map-loading">
        <div class="spinner"></div>
        <p>{{ t.loadingMap || 'Loading map...' }}</p>
      </div>

      <!-- Map Controls Overlay -->
      <div class="map-controls">
        <button class="map-control-btn" @click="centerOnUser" title="Center on my location">
          <i class="fas fa-crosshairs"></i>
        </button>
        <button class="map-control-btn" @click="zoomIn" title="Zoom in">
          <i class="fas fa-plus"></i>
        </button>
        <button class="map-control-btn" @click="zoomOut" title="Zoom out">
          <i class="fas fa-minus"></i>
        </button>
      </div>
    </div>

    <!-- Info Panel -->
    <div v-if="userLocation && userLocation.latitude" class="map-info-panel">
      <div class="info-header">
        <h3>{{ t.yourLocation || 'Your Location' }}</h3>
        <p class="info-subtext">{{ userLocation.address || 'Kigali, Rwanda' }}</p>
      </div>

      <!-- Coordinates Display -->
      <div class="coordinates-display">
        <div class="coord-item">
          <span class="coord-label">Latitude:</span>
          <span class="coord-value">{{ userLocation.latitude.toFixed(4) }}°</span>
        </div>
        <div class="coord-item">
          <span class="coord-label">Longitude:</span>
          <span class="coord-value">{{ userLocation.longitude.toFixed(4) }}°</span>
        </div>
        <div class="coord-item">
          <span class="coord-label">Accuracy:</span>
          <span class="coord-value">±{{ Math.round(userLocation.accuracy) }}m</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import { findNearestStops } from '../composables/useLocationUtils.js'

const mapContainer = ref(null)
let map = null
let userMarker = null
let stopsMarkers = []
let routingControl = null

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const userLocation = computed(() => store.userLocation)
const isLoading = ref(false)

// Initialize map
const initializeMap = () => {
  if (map || !mapContainer.value) return

  map = L.map(mapContainer.value).setView([51.505, -0.09], 13)

  // Use OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    maxNativeZoom: 18
  }).addTo(map)

  // Add user's location marker if available
  if (userLocation.value && userLocation.value.latitude) {
    addUserMarker(userLocation.value.latitude, userLocation.value.longitude)
    loadNearbyStops(userLocation.value.latitude, userLocation.value.longitude)
  }
}

// Add user location marker
const addUserMarker = (lat, lng) => {
  if (userMarker) {
    map.removeLayer(userMarker)
  }

  // Create a custom icon for user location
  const userIcon = L.divIcon({
    html: `
      <div class="user-marker">
        <i class="fas fa-location-dot"></i>
      </div>
    `,
    className: 'user-location-marker',
    iconSize: [40, 40],
    popupAnchor: [0, -20]
  })

  userMarker = L.marker([lat, lng], { icon: userIcon })
    .bindPopup(`
      <div class="marker-popup">
        <strong>${t.value.yourLocation || 'Your Location'}</strong><br/>
        Lat: ${lat.toFixed(4)}<br/>
        Lng: ${lng.toFixed(4)}
      </div>
    `)
    .addTo(map)

  map.setView([lat, lng], 15)
}

// Load and display nearby bus stops
const loadNearbyStops = (lat, lng) => {
  // Clear existing stop markers
  stopsMarkers.forEach(marker => map.removeLayer(marker))
  stopsMarkers = []

  // Find nearest stops
  const nearest = findNearestStops(lat, lng, 8)

  // Add stop markers
  nearest.forEach(stop => {
    const stopIcon = L.divIcon({
      html: `
        <div class="stop-marker ${stop.type}">
          <i class="fas fa-bus"></i>
        </div>
      `,
      className: 'bus-stop-marker',
      iconSize: [32, 32],
      popupAnchor: [0, -16]
    })

    const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], { icon: stopIcon })
      .bindPopup(`
        <div class="marker-popup stop-popup">
          <strong>${stop.name}</strong><br/>
          <span class="stop-type">${stop.type === 'station' ? 'Bus Station' : 'Road Side Stop'}</span><br/>
          ${stop.area ? `<span class="stop-area">${stop.area}</span><br/>` : ''}
          ${stop.code ? `<span class="stop-code">Code: ${stop.code}</span><br/>` : ''}
          ${stop.distance ? `<span class="stop-distance">${stop.distance.toFixed(2)} km away</span>` : ''}
        </div>
      `)
      .on('click', () => onStopSelected(stop))
      .addTo(map)

    stopsMarkers.push(marker)
  })
}

// Handle stop selection
const onStopSelected = (stop) => {
  // Emit event or update store
  store.selectedStopForTracking = stop
}

// Map control functions
const centerOnUser = () => {
  if (userLocation.value && userLocation.value.latitude && map) {
    map.setView([userLocation.value.latitude, userLocation.value.longitude], 15)
  }
}

const zoomIn = () => {
  map?.zoomIn()
}

const zoomOut = () => {
  map?.zoomOut()
}

// Watch for location updates
watch(
  () => userLocation.value,
  (newLocation) => {
    if (newLocation && newLocation.latitude && map) {
      addUserMarker(newLocation.latitude, newLocation.longitude)
      loadNearbyStops(newLocation.latitude, newLocation.longitude)
    }
  },
  { deep: true }
)

// Initialize on mount
onMounted(() => {
  initializeMap()
})

// Cleanup on unmount
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.location-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Map Wrapper */
.map-wrapper {
  position: relative;
  flex: 1;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

.map {
  width: 100%;
  height: 100%;
}

/* Map Loading */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-secondary);
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Map Controls */
.map-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 50;
}

.map-control-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-control-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.map-control-btn:active {
  transform: scale(0.95);
}

/* Info Panel */
.map-info-panel {
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  max-height: 25vh;
  overflow-y: auto;
}

.info-header {
  margin-bottom: 12px;
}

.info-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.info-subtext {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Coordinates Display */
.coordinates-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.coord-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.coord-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coord-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

/* Leaflet Map Customization */
:deep(.user-location-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2E7D32;
  border: 3px solid white;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 8px rgba(46, 125, 50, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

:deep(.bus-stop-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FF6F00;
  border: 2px solid white;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(255, 111, 0, 0.3);
}

:deep(.bus-stop-marker.station) {
  background: #1976D2;
}

:deep(.marker-popup) {
  font-size: 12px;
  min-width: 150px;
}

:deep(.marker-popup strong) {
  display: block;
  margin-bottom: 4px;
  color: #333;
}

:deep(.marker-popup .stop-type) {
  display: block;
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

:deep(.marker-popup .stop-area) {
  display: block;
  font-size: 11px;
  color: #999;
}

:deep(.marker-popup .stop-code) {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #2E7D32;
  margin-top: 4px;
}

:deep(.marker-popup .stop-distance) {
  display: block;
  font-size: 11px;
  color: #FF6F00;
  font-weight: 500;
  margin-top: 4px;
}

:deep(.leaflet-popup-close-button) {
  width: 24px !important;
  height: 24px !important;
  font-size: 18px !important;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 600px) {
  .map-wrapper {
    min-height: 300px;
  }

  .map-info-panel {
    max-height: 30vh;
  }

  .coordinates-display {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Dark mode overrides */
html.dark .map-wrapper {
  background: var(--surface);
}

html.dark .map-loading {
  background: rgba(10, 10, 10, 0.95);
  color: var(--text);
}

html.dark .map-loading p {
  color: var(--text-muted);
}

html.dark .spinner {
  border-color: var(--surface);
  border-top-color: var(--green);
}

html.dark .map-control-btn {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

html.dark .map-control-btn:hover {
  background: var(--hover);
}

html.dark .user-location-marker {
  background: var(--green) !important;
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3) !important;
}

html.dark .bus-stop-marker.station {
  background: var(--green) !important;
}

html.dark .marker-popup strong {
  color: var(--text);
}

html.dark .marker-popup .stop-type {
  color: var(--text-muted);
}

html.dark .marker-popup .stop-area {
  color: var(--text-muted);
}

html.dark .marker-popup .stop-code {
  color: var(--green);
}

html.dark .leaflet-popup-close-button {
  color: var(--text-muted) !important;
}
</style>
