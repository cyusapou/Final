<template>
  <div class="location-picker">
    <!-- Search Header -->
    <div class="search-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder"
          @input="performSearch"
          @focus="showResults = true"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Quick Location Access -->
      <div class="quick-access">
        <button 
          v-if="userLocation && userLocation.latitude"
          class="quick-btn current-location"
          @click="selectCurrentLocation"
        >
          <i class="fas fa-crosshairs"></i>
          {{ t.currentLocation || 'My Location' }}
        </button>
        <button 
          class="quick-btn"
          @click="openMap"
        >
          <i class="fas fa-map"></i>
          {{ t.chooseOnMap || 'Choose on Map' }}
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="showResults" class="results-section">
      <!-- Loading -->
      <div v-if="isSearching" class="results-loading">
        <div class="spinner-small"></div>
        <p>{{ t.searching || 'Searching...' }}</p>
      </div>

      <!-- Search Results -->
      <div v-else-if="searchResults.length > 0" class="results-list">
        <div 
          v-for="result in searchResults" 
          :key="result.id"
          class="result-item"
          @click="selectLocation(result)"
        >
          <div class="result-icon">
            <i class="fas fa-map-pin"></i>
          </div>
          <div class="result-info">
            <p class="result-name">{{ result.name }}</p>
            <p class="result-type">{{ result.city }}<span v-if="result.area"> • {{ result.area }}</span></p>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>

      <!-- No Results -->
      <div v-else-if="searchQuery" class="no-results">
        <i class="fas fa-search"></i>
        <p>{{ t.noStopsFound || 'No stops found' }}</p>
      </div>

      <!-- All Stops -->
      <div v-else class="all-stops">
        <div class="stops-header">
          <span>{{ t.allBusStops || 'All Bus Stops' }}</span>
          <span class="stops-count">{{ allStops.length }}</span>
        </div>
        <div class="results-list">
          <div 
            v-for="stop in allStops.slice(0, 10)" 
            :key="stop.id"
            class="result-item"
            @click="selectLocation(stop)"
          >
            <div class="result-icon" :class="stop.type">
              <i class="fas fa-bus"></i>
            </div>
            <div class="result-info">
              <p class="result-name">{{ stop.name }}</p>
              <p class="result-type">{{ stop.city }}<span v-if="stop.area"> • {{ stop.area }}</span></p>
            </div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Location & Nearest Stops -->
    <div v-if="selectedLocation" class="selected-section">
      <!-- Selected Location -->
      <div class="selected-location">
        <h3>{{ t.selectedLocation || 'Selected Location' }}</h3>
        <div class="location-card">
          <div class="location-header">
            <div class="location-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="location-details">
              <p class="location-name">{{ selectedLocation.name }}</p>
              <p class="location-meta">{{ selectedLocation.city }}<span v-if="selectedLocation.area"> • {{ selectedLocation.area }}</span></p>
            </div>
            <button class="change-btn" @click="clearSelection">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Nearest Stops to Selected Location -->
      <div class="nearest-stops-section">
        <h3>{{ t.nearestStopsTo || 'Nearest Bus Stops' }}</h3>
        
        <div v-if="nearestToSelected.length > 0" class="nearest-stops-list">
          <div 
            v-for="stop in nearestToSelected" 
            :key="`nearest-${stop.id}`"
            class="nearest-stop-item"
            @click="selectStop(stop)"
          >
            <div class="stop-rank">
              <span class="rank-number">{{ nearestToSelected.indexOf(stop) + 1 }}</span>
            </div>
            
            <div class="stop-details">
              <p class="stop-name">{{ stop.name }}</p>
              <div class="stop-meta">
                <span class="stop-type">{{ stop.type === 'station' ? 'Station' : 'Road Stop' }}</span>
                <span class="stop-distance">{{ stop.distance.toFixed(1) }} km</span>
                <span v-if="stop.code" class="stop-code">Code: {{ stop.code }}</span>
              </div>
            </div>

            <div class="stop-action">
              <button class="select-stop-btn" @click.stop="selectStop(stop)">
                <i class="fas fa-check"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="no-nearby-stops">
          <i class="fas fa-info-circle"></i>
          <p>{{ t.noNearbyStops || 'No nearby stops found' }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="action-buttons">
        <button class="btn btn-primary" @click="confirmSelection">
          <i class="fas fa-check"></i>
          {{ t.confirm || 'Confirm' }}
        </button>
        <button class="btn btn-secondary" @click="clearSelection">
          <i class="fas fa-times"></i>
          {{ t.cancel || 'Cancel' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import { stops } from '../store/index.js'
import { findNearestStops } from '../composables/useLocationUtils.js'

const emit = defineEmits(['destination-selected', 'origin-selected', 'close'])

const props = defineProps({
  mode: {
    type: String,
    default: 'destination' // 'destination' or 'origin'
  },
  placeholder: {
    type: String,
    default: null
  }
})

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const userLocation = computed(() => store.userLocation)

const searchQuery = ref('')
const showResults = ref(false)
const isSearching = ref(false)
const selectedLocation = ref(null)
const selectedStop = ref(null)
const nearestToSelected = ref([])

// Get all stops
const allStops = computed(() => stops)

// Computed placeholder
const computedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  if (props.mode === 'origin') return t.value.whereBoarding || 'Where are you boarding?'
  return t.value.whereGettingOff || 'Where are you getting off?'
})

// Search results
const searchResults = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase()
  return stops
    .filter(stop => 
      stop.name.toLowerCase().includes(query) ||
      (stop.city && stop.city.toLowerCase().includes(query)) ||
      (stop.area && stop.area.toLowerCase().includes(query)) ||
      (stop.code && stop.code.includes(query))
    )
    .slice(0, 15)
})

// Perform search
const performSearch = () => {
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
  }, 300)
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  showResults.value = false
}

// Select current location
const selectCurrentLocation = () => {
  if (!userLocation.value || !userLocation.value.latitude) return
  
  selectedLocation.value = {
    id: 'current',
    name: userLocation.value.address || 'My Current Location',
    city: 'Current',
    coordinates: {
      lat: userLocation.value.latitude,
      lng: userLocation.value.longitude
    }
  }
  
  nearestToSelected.value = findNearestStops(
    userLocation.value.latitude,
    userLocation.value.longitude,
    8
  )
  
  showResults.value = false
  searchQuery.value = ''
}

// Select location from search
const selectLocation = (location) => {
  selectedLocation.value = location
  showResults.value = false
  searchQuery.value = ''
  
  // Get approximate coordinates for the location
  let lat = -1.9473
  let lng = 30.0567
  
  if (location.area === 'Remera') {
    lat = -1.9433
    lng = 30.0589
  } else if (location.area === 'Kimironko') {
    lat = -1.9505
    lng = 30.0612
  } else if (location.area === 'Kanombe') {
    lat = -1.9567
    lng = 30.0534
  } else if (location.area === 'Gatenga') {
    lat = -1.9589
    lng = 30.0456
  } else if (location.area === 'Nyabugogo') {
    lat = -1.9645
    lng = 30.0723
  }
  
  // Add coordinates if not present
  if (!location.coordinates) {
    location.coordinates = { lat, lng }
  }
  
  // Find nearest stops
  nearestToSelected.value = findNearestStops(lat, lng, 8)
}

// Select a stop from nearest list
const selectStop = (stop) => {
  selectedStop.value = stop
}

// Clear selection
const clearSelection = () => {
  selectedLocation.value = null
  selectedStop.value = null
  nearestToSelected.value = []
  searchQuery.value = ''
  showResults.value = false
}

// Confirm selection
const confirmSelection = () => {
  const selected = selectedStop.value || selectedLocation.value
  
  if (!selected) return
  
  const eventData = {
    location: selectedLocation.value,
    stop: selectedStop.value || selectedLocation.value
  }
  
  if (props.mode === 'origin') {
    store.selectedOriginStop = eventData.stop
    emit('origin-selected', eventData)
  } else {
    store.selectedDestinationStop = eventData.stop
    emit('destination-selected', eventData)
  }
  
  emit('close')
}

// Open map for selection
const openMap = () => {
  // This could open an enhanced map view
  console.log('Open map selection')
}
</script>

<style scoped>
.location-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  height: 44px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #2E7D32;
  background: var(--bg-primary);
}

.search-box i {
  color: var(--text-tertiary);
  font-size: 16px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  font-weight: 500;
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

/* Quick Access */
.quick-access {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.quick-btn:hover {
  background: var(--bg-secondary);
  border-color: #2E7D32;
  color: #2E7D32;
}

.quick-btn.current-location {
  background: #E8F5E9;
  border-color: #2E7D32;
  color: #2E7D32;
}

/* Results Section */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.results-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  text-align: center;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid var(--bg-primary);
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-loading p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  background: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover {
  background: #E8F5E9;
  transform: translateX(4px);
}

.result-icon {
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

.result-icon.station {
  background: #1976D2;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  margin: 0 0 2px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.result-type {
  margin: 0;
  font-size: 11px;
  color: var(--text-tertiary);
}

.result-item i:last-of-type {
  color: var(--text-tertiary);
  font-size: 14px;
}

.no-results,
.no-nearby-stops {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  text-align: center;
  color: var(--text-secondary);
}

.no-results i,
.no-nearby-stops i {
  font-size: 32px;
  opacity: 0.5;
}

.no-results p,
.no-nearby-stops p {
  margin: 0;
  font-size: 13px;
}

.all-stops {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stops-count {
  background: #2E7D32;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
}

/* Selected Section */
.selected-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.selected-location h3,
.nearest-stops-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.location-card {
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid #2E7D32;
}

.location-header {
  display: flex;
  gap: 12px;
  align-items: center;
}

.location-icon {
  width: 36px;
  height: 36px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E7D32;
  font-size: 16px;
  flex-shrink: 0;
}

.location-details {
  flex: 1;
  min-width: 0;
}

.location-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.location-meta {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.change-btn {
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

.change-btn:hover {
  background: #FFE0B2;
  border-color: #FF6F00;
  color: #FF6F00;
}

/* Nearest Stops List */
.nearest-stops-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nearest-stop-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 3px solid #FF6F00;
  cursor: pointer;
  transition: all 0.2s;
}

.nearest-stop-item:hover {
  background: #FFE0B2;
  border-left-color: #E65100;
}

.stop-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
}

.rank-number {
  width: 28px;
  height: 28px;
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.stop-details {
  flex: 1;
  min-width: 0;
}

.stop-name {
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.stop-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 11px;
}

.stop-type {
  background: #FF6F00;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.stop-distance {
  color: var(--text-secondary);
}

.stop-code {
  background: var(--bg-primary);
  color: #2E7D32;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.stop-action {
  flex-shrink: 0;
}

.select-stop-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  color: #2E7D32;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.select-stop-btn:hover {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

/* Responsive */
@media (max-width: 600px) {
  .quick-access {
    flex-direction: column;
  }

  .quick-btn {
    min-width: unset;
  }

  .results-section {
    max-height: 300px;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }
}
</style>
