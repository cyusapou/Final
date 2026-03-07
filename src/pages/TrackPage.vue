<template>
  <div class="track-page">
    <div class="track-container">
      <header class="track-header">
        <button class="btn-back" @click="goBack" aria-label="Go back">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="header-text">
          <h1>{{ t.track }}</h1>
          <p class="header-subtitle">{{ t.trackYourJourney || 'Track buses and find nearby stops' }}</p>
        </div>
      </header>

      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Tab: Find Nearest Stop -->
      <section v-if="activeTab === 'nearest'" class="tab-content slide-up">
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon green">
              <i class="fas fa-crosshairs"></i>
            </div>
            <div>
              <h2>{{ t.nearestStops || 'Find Nearest Stop' }}</h2>
              <p>{{ t.findingNearestStop || 'Locate the closest bus stop to you' }}</p>
            </div>
          </div>

          <button
            class="action-btn green"
            @click="handleFindNearest"
            :disabled="isFindingNearest"
          >
            <i :class="isFindingNearest ? 'fas fa-spinner fa-spin' : 'fas fa-location-arrow'"></i>
            {{ isFindingNearest ? (t.loading || 'Finding...') : (t.getMyLocation || 'Find My Nearest Stop') }}
          </button>

          <div v-if="locationError" class="error-banner">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ locationError }}</span>
            <button @click="locationError = null" class="dismiss-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Nearest stops results -->
          <div v-if="nearbyStops.length > 0" class="stops-results">
            <h3 class="results-title">
              <i class="fas fa-map-marker-alt"></i>
              {{ nearbyStops.length }} {{ t.nearestStops || 'stops found nearby' }}
            </h3>
            <div class="stop-list">
              <div
                v-for="(stop, index) in nearbyStops"
                :key="stop.id"
                :class="['stop-card', { selected: selectedStop?.id === stop.id }]"
                @click="handleSelectStop(stop)"
              >
                <div class="stop-rank">{{ index + 1 }}</div>
                <div class="stop-details">
                  <h4>{{ stop.name }}</h4>
                  <div class="stop-meta">
                    <span class="stop-type-badge" :class="stop.type">
                      {{ stop.type === 'station' ? 'Station' : 'Bus Stop' }}
                    </span>
                    <span v-if="stop.area" class="stop-area">{{ stop.area }}</span>
                  </div>
                  <p class="stop-distance">
                    <i class="fas fa-walking"></i>
                    {{ stop.distance.toFixed(2) }} km
                    <span class="walk-time">~ {{ Math.ceil(stop.distance * 12) }} min walk</span>
                  </p>
                </div>
                <div class="stop-action">
                  <i class="fas fa-directions"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab: Live Bus Tracking -->
      <section v-if="activeTab === 'track'" class="tab-content slide-up">
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon blue">
              <i class="fas fa-bus"></i>
            </div>
            <div>
              <h2>{{ t.realTimeBusTracking || 'Live Bus Tracking' }}</h2>
              <p>{{ t.tapToTrackBus || 'See buses moving in real-time on the map' }}</p>
            </div>
          </div>

          <!-- Bus simulation controls -->
          <div class="tracking-controls">
            <button
              :class="['action-btn', isSimulationRunning ? 'orange' : 'blue']"
              @click="toggleBusSimulation"
            >
              <i :class="isSimulationRunning ? 'fas fa-pause' : 'fas fa-play'"></i>
              {{ isSimulationRunning ? (t.stopTracking || 'Pause Tracking') : 'Start Live Tracking' }}
            </button>
          </div>

          <!-- Active buses -->
          <div v-if="activeBuses.length > 0" class="bus-list">
            <h3 class="results-title">
              <span class="live-dot"></span>
              {{ activeBuses.length }} active buses
            </h3>
            <div
              v-for="bus in activeBuses"
              :key="bus.id"
              class="bus-card"
              @click="handleSelectBus(bus)"
            >
              <div class="bus-icon-wrap">
                <i class="fas fa-bus"></i>
              </div>
              <div class="bus-details">
                <h4>Bus {{ bus.id }}</h4>
                <p class="bus-route">{{ bus.route }}</p>
                <div class="bus-stats">
                  <span><i class="fas fa-tachometer-alt"></i> {{ bus.speed }} km/h</span>
                  <span class="bus-status-badge active">{{ bus.status }}</span>
                </div>
              </div>
              <div class="bus-time">
                {{ formatTime(bus.lastUpdated) }}
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-satellite-dish"></i>
            <p>No active buses detected. Start live tracking to see buses on the map.</p>
          </div>
        </div>
      </section>

      <!-- Tab: Route / Map View -->
      <section v-if="activeTab === 'map'" class="tab-content slide-up">
        <div class="section-card map-card">
          <div class="section-header">
            <div class="section-icon purple">
              <i class="fas fa-map"></i>
            </div>
            <div>
              <h2>{{ t.map || 'Map View' }}</h2>
              <p>See all stations, buses, and your route</p>
            </div>
          </div>

          <!-- Quick action bar above map -->
          <div class="map-actions">
            <button class="map-action-btn" @click="handleFindNearestFromMap" :disabled="isFindingNearest">
              <i class="fas fa-crosshairs"></i>
              <span>Find Me</span>
            </button>
            <button class="map-action-btn" v-if="mapUserLocation" @click="centerMapOnUser">
              <i class="fas fa-location-arrow"></i>
              <span>Center</span>
            </button>
            <button class="map-action-btn" v-if="showMapRoute" @click="clearMapRoute">
              <i class="fas fa-times"></i>
              <span>Clear Route</span>
            </button>
            <button class="map-action-btn" @click="resetMapView">
              <i class="fas fa-sync-alt"></i>
              <span>Reset</span>
            </button>
          </div>

          <!-- Map container -->
          <div class="map-wrapper">
            <BusMapFeature ref="busMapRef" />
          </div>

          <!-- Route info bar -->
          <div v-if="selectedStop && mapUserLocation" class="route-info-bar">
            <div class="route-endpoints">
              <div class="route-point">
                <span class="point-dot green"></span>
                <span>Your Location</span>
              </div>
              <div class="route-line"></div>
              <div class="route-point">
                <span class="point-dot red"></span>
                <span>{{ selectedStop.name }}</span>
              </div>
            </div>
            <div class="route-stats">
              <span><i class="fas fa-road"></i> {{ selectedStop.distance?.toFixed(2) || '–' }} km</span>
              <span><i class="fas fa-walking"></i> ~ {{ Math.ceil((selectedStop.distance || 0) * 12) }} min</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Tab: Saved / Tracked Stations -->
      <section v-if="activeTab === 'saved'" class="tab-content slide-up">
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon amber">
              <i class="fas fa-bookmark"></i>
            </div>
            <div>
              <h2>{{ t.trackedStations || 'Saved Stops' }}</h2>
              <p>Your tracked stations for quick access</p>
            </div>
          </div>

          <div v-if="store.coordinates.length > 0" class="saved-list">
            <div
              v-for="(coord, index) in store.coordinates"
              :key="index"
              class="saved-card"
            >
              <div class="saved-icon" :class="coord.type === 'station' ? 'station' : 'stop'">
                <i :class="coord.type === 'station' ? 'fas fa-building' : 'fas fa-map-pin'"></i>
              </div>
              <div class="saved-details">
                <h4>{{ coord.name }}</h4>
                <p class="saved-coords">{{ coord.lat.toFixed(4) }}, {{ coord.lng.toFixed(4) }}</p>
                <span v-if="coord.area" class="saved-area">{{ coord.area }}</span>
              </div>
              <button
                class="remove-btn"
                @click="removeCoordinate(index)"
                aria-label="Remove station"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-bookmark"></i>
            <p>No saved stops yet. Find a nearby stop and it will appear here.</p>
            <button class="action-btn green" @click="activeTab = 'nearest'">
              <i class="fas fa-search-location"></i>
              Find Nearest Stop
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import { findNearestStops } from '../composables/useLocationUtils.js'
import BusMapFeature from '../components/BusMapFeature.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const activeTab = ref('nearest')
const busMapRef = ref(null)
const nearbyStops = ref([])
const selectedStop = ref(null)
const isFindingNearest = ref(false)
const locationError = ref(null)
const isSimulationRunning = ref(false)
const mapUserLocation = ref(null)
const showMapRoute = ref(false)

const activeBuses = ref([
  { id: 101, lat: -1.9645, lng: 30.0723, route: 'Nyabugogo → Remera', speed: 25, status: 'Active', lastUpdated: new Date() },
  { id: 102, lat: -1.9433, lng: 30.0589, route: 'Kimironko → City Center', speed: 30, status: 'Active', lastUpdated: new Date() },
  { id: 103, lat: -1.9256, lng: 30.1034, route: 'Kicukiro → Kanombe', speed: 20, status: 'Active', lastUpdated: new Date() },
  { id: 104, lat: -1.9536, lng: 30.0867, route: 'Gatenga → Nyarugenge', speed: 35, status: 'Active', lastUpdated: new Date() },
])

let busSimInterval = null

const tabs = computed(() => [
  { id: 'nearest', icon: 'fas fa-crosshairs', label: t.value.nearestStops || 'Nearest' },
  { id: 'track', icon: 'fas fa-bus', label: t.value.track || 'Track' },
  { id: 'map', icon: 'fas fa-map', label: t.value.map || 'Map' },
  { id: 'saved', icon: 'fas fa-bookmark', label: t.value.trackedStations || 'Saved' },
])

const goBack = () => router.back()

const handleFindNearest = async () => {
  isFindingNearest.value = true
  locationError.value = null
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      })
    })

    store.userLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date(),
      address: 'Kigali, Rwanda'
    }
    store.locationFetched = true
    mapUserLocation.value = { lat: position.coords.latitude, lng: position.coords.longitude }

    const stops = findNearestStops(position.coords.latitude, position.coords.longitude, 5)
    nearbyStops.value = stops

    if (stops.length > 0) {
      const station = stops[0]
      selectedStop.value = station
      saveStopToCoordinates(station)
    }
  } catch (err) {
    switch (err.code) {
      case 1: locationError.value = 'Location permission denied. Please enable GPS.'; break
      case 2: locationError.value = 'Location unavailable. Check your GPS settings.'; break
      case 3: locationError.value = 'Location request timed out. Try again.'; break
      default: locationError.value = 'Could not get your location.'
    }
  } finally {
    isFindingNearest.value = false
  }
}

const handleSelectStop = (stop) => {
  selectedStop.value = stop
  saveStopToCoordinates(stop)
  showMapRoute.value = true
}

const saveStopToCoordinates = (station) => {
  const stationLat = station.coordinates?.lat || station.latitude || -1.9473
  const stationLng = station.coordinates?.lng || station.longitude || 30.0567

  const exists = store.coordinates.findIndex(c => c.name === station.name)
  if (exists === -1) {
    store.coordinates.push({
      name: station.name,
      lat: stationLat,
      lng: stationLng,
      id: station.id,
      type: station.type,
      area: station.area || null
    })
  }
}

const toggleBusSimulation = () => {
  if (isSimulationRunning.value) {
    clearInterval(busSimInterval)
    busSimInterval = null
    isSimulationRunning.value = false
  } else {
    isSimulationRunning.value = true
    busSimInterval = setInterval(() => {
      activeBuses.value = activeBuses.value.map(bus => ({
        ...bus,
        lat: bus.lat + (Math.random() - 0.5) * 0.001,
        lng: bus.lng + (Math.random() - 0.5) * 0.001,
        speed: Math.max(5, Math.min(60, bus.speed + (Math.random() - 0.5) * 10)),
        lastUpdated: new Date()
      }))
    }, 3000)
  }
}

const handleSelectBus = (bus) => {
  activeTab.value = 'map'
}

const handleFindNearestFromMap = async () => {
  await handleFindNearest()
  if (selectedStop.value) {
    showMapRoute.value = true
  }
}

const centerMapOnUser = () => {
  if (busMapRef.value) {
    busMapRef.value.centerOnUser()
  }
}

const clearMapRoute = () => {
  showMapRoute.value = false
  if (busMapRef.value) {
    busMapRef.value.clearRoute()
  }
}

const resetMapView = () => {
  if (busMapRef.value) {
    busMapRef.value.resetView()
  }
}

const removeCoordinate = (index) => {
  store.coordinates.splice(index, 1)
}

const formatTime = (date) => {
  if (!date) return '–'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onUnmounted(() => {
  if (busSimInterval) {
    clearInterval(busSimInterval)
  }
  if (store.trackingIntervalId) {
    clearInterval(store.trackingIntervalId)
    store.trackingIntervalId = null
  }
  store.isTrackingBus = false
  store.busLocation = { latitude: null, longitude: null, lastUpdated: null }
})
</script>

<style scoped>
.track-page {
  min-height: 100vh;
  background: var(--gradient-hero);
  padding-bottom: 80px;
}

.track-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Header */
.track-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 0 12px;
}

.btn-back {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: var(--primary-green-bg);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

.header-text h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.header-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* Tab Navigation */
.tab-nav {
  display: flex;
  gap: 6px;
  padding: 4px;
  background: var(--card-bg);
  border-radius: 14px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  transition: all 0.25s;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.tab-btn i { font-size: 16px; }

.tab-btn.active {
  background: var(--primary-green);
  color: white;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.tab-btn:not(.active):hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Section Cards */
.section-card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  padding: 24px;
  box-shadow: var(--card-shadow);
  transition: background-color 0.3s, border-color 0.3s;
}

.section-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.section-icon.green { background: #E8F5E9; color: #2E7D32; }
.section-icon.blue { background: #E3F2FD; color: #1976D2; }
.section-icon.purple { background: #F3E5F5; color: #7B1FA2; }
.section-icon.amber { background: #FFF3E0; color: #F57C00; }

html.dark .section-icon.green { background: rgba(34,197,94,0.08); color: var(--green); }
html.dark .section-icon.blue { background: rgba(25,118,210,0.15); color: #64B5F6; }
html.dark .section-icon.purple { background: rgba(123,31,162,0.15); color: #CE93D8; }
html.dark .section-icon.amber { background: rgba(245,124,0,0.15); color: #FFB74D; }

.section-header h2 {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-header p {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 3px 0 0;
}

/* Action Button */
.action-btn {
  width: 100%;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.25s;
  margin-bottom: 16px;
}

.action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.action-btn.green { background: var(--primary-green); color: white; }
.action-btn.green:hover:not(:disabled) {
  background: var(--primary-green-dark);
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.35);
  transform: translateY(-1px);
}

.action-btn.blue { background: #1976D2; color: white; }
.action-btn.blue:hover:not(:disabled) {
  background: #1565C0;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.35);
}

.action-btn.orange { background: #F57C00; color: white; }
.action-btn.orange:hover:not(:disabled) {
  background: #EF6C00;
  box-shadow: 0 4px 16px rgba(245, 124, 0, 0.35);
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #FFF3E0;
  border: 1px solid #FFE0B2;
  border-radius: 10px;
  color: #E65100;
  font-size: 13px;
  margin-bottom: 16px;
}

html.dark .error-banner { background: rgba(230,81,0,0.1); border-color: rgba(230,81,0,0.2); }

.error-banner i { font-size: 16px; flex-shrink: 0; }
.error-banner span { flex: 1; }

.dismiss-btn {
  background: none;
  border: none;
  color: #E65100;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
}

/* Stop List */
.results-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stop-list { display: flex; flex-direction: column; gap: 10px; }

.stop-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.stop-card:hover {
  background: var(--primary-green-bg);
  border-color: var(--primary-green-light);
}

html.dark .stop-card:hover {
  background: rgba(46, 125, 50, 0.1);
}

.stop-card.selected {
  border-color: var(--primary-green);
  background: var(--primary-green-bg);
}

html.dark .stop-card.selected {
  background: rgba(46, 125, 50, 0.15);
}

.stop-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.stop-details { flex: 1; min-width: 0; }

.stop-details h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.stop-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.stop-type-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stop-type-badge.station { background: #E8F5E9; color: #2E7D32; }
.stop-type-badge.stop, .stop-type-badge.roadside { background: #E3F2FD; color: #1976D2; }

html.dark .stop-type-badge.station { background: rgba(46,125,50,0.2); }
html.dark .stop-type-badge.stop, html.dark .stop-type-badge.roadside { background: rgba(25,118,210,0.2); }

.stop-area {
  font-size: 12px;
  color: var(--text-tertiary);
}

.stop-distance {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.walk-time {
  color: var(--text-tertiary);
  font-size: 11px;
}

.stop-action {
  color: var(--primary-green);
  font-size: 18px;
  flex-shrink: 0;
}

/* Bus List */
.live-dot {
  width: 8px;
  height: 8px;
  background: #4CAF50;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-dot 2s infinite;
}

.bus-list { display: flex; flex-direction: column; gap: 10px; }

.bus-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.bus-card:hover {
  background: #E3F2FD;
}

html.dark .bus-card:hover {
  background: rgba(25, 118, 210, 0.1);
}

.bus-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #1976D2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.bus-details { flex: 1; min-width: 0; }
.bus-details h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.bus-route { font-size: 12px; color: var(--text-secondary); margin: 2px 0 4px; }

.bus-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.bus-status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-size: 9px;
}

.bus-status-badge.active { background: #E8F5E9; color: #2E7D32; }
html.dark .bus-status-badge.active { background: rgba(46,125,50,0.2); }

.bus-time {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

/* Map Card */
.map-card { padding: 0; overflow: hidden; }
.map-card .section-header { padding: 20px 24px 12px; margin-bottom: 0; }

.map-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
}

.map-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.map-action-btn:hover {
  background: var(--primary-green-bg);
  border-color: var(--primary-green);
  color: var(--primary-green);
}

html.dark .map-action-btn:hover {
  background: rgba(46,125,50,0.15);
}

.map-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.map-wrapper {
  min-height: 400px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 500px) {
  .map-wrapper { min-height: 320px; }
}

.route-info-bar {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.route-endpoints {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.point-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.point-dot.green { background: var(--primary-green); }
.point-dot.red { background: #D32F2F; }

.route-line {
  flex: 1;
  height: 2px;
  background: var(--border-color);
  background-image: repeating-linear-gradient(
    90deg,
    var(--text-tertiary) 0px,
    var(--text-tertiary) 4px,
    transparent 4px,
    transparent 8px
  );
}

.route-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

.route-stats i { color: var(--primary-green); margin-right: 4px; }

/* Saved Stops */
.saved-list { display: flex; flex-direction: column; gap: 10px; }

.saved-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  transition: all 0.2s;
}

.saved-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.saved-icon.station { background: #E8F5E9; color: #2E7D32; }
.saved-icon.stop { background: #F3E5F5; color: #7B1FA2; }

html.dark .saved-icon.station { background: rgba(46,125,50,0.15); }
html.dark .saved-icon.stop { background: rgba(123,31,162,0.15); }

.saved-details { flex: 1; min-width: 0; }
.saved-details h4 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }

.saved-coords {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: 'Courier New', monospace;
  margin: 2px 0;
}

.saved-area {
  font-size: 11px;
  color: var(--text-secondary);
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(211, 47, 47, 0.08);
  color: #D32F2F;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(211, 47, 47, 0.15);
  transform: scale(1.05);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-tertiary);
}

.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.empty-state .action-btn {
  width: auto;
  display: inline-flex;
  margin: 0 auto;
}

/* Tracking Controls */
.tracking-controls {
  margin-bottom: 16px;
}

/* Mobile */
@media (max-width: 500px) {
  .track-container { padding: 0 12px; }
  .track-header { padding: 16px 0 10px; }
  .track-header h1 { font-size: 20px; }
  .section-card { padding: 18px; border-radius: 14px; }
  .tab-btn span { font-size: 9px; }
  .tab-btn i { font-size: 14px; }
  .tab-btn { padding: 8px 6px; }
}

/* Animation */
.slide-up {
  animation: slideUp 0.3s ease-out;
}
</style>
