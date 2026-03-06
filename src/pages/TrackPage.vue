 <template>
  <div class="track-page bg-white dark:bg-neutral-900 transition-colors">
    <div class="container">
      <!-- Mobile: Language toggle -->
      <div class="mobile-lang-toggle">
        <LanguageToggle />
      </div>

      <!-- Page Header -->
      <div class="page-header">
        <button class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1>{{ t.track }}</h1>
      </div>

      <!-- Tracking Controls Card -->
      <section class="tracking-card card">
        <div class="card-header">
          <h2>🚀 {{ t.realTimeBusTracking || 'Real-time Bus Tracking' }}</h2>
        </div>
        <div class="card-body">
          <p class="description">{{ t.tapToTrackBus || 'Tap to track bus in real-time' }}</p>
          
          <div class="button-group">
            <button 
              class="btn btn-primary" 
              @click="handleTrackLocation"
              :disabled="isTracking"
            >
              <i class="fas fa-crosshairs"></i>
              {{ isTracking ? 'Tracking...' : (t.trackLocation || 'Track Location') }}
            </button>
            
            <button 
              v-if="nearestStation"
              class="btn btn-accent" 
              @click="handleTrackBus"
              :disabled="isTrackingBus"
            >
              <i class="fas fa-bus"></i>
              {{ isTrackingBus ? (t.trackingBus || 'Tracking...') : (t.trackBusRealTime || 'Track Bus') }}
            </button>
          </div>

          <!-- Station & Bus Info -->
          <div v-if="nearestStation || store.busLocation.latitude" class="info-grid">
            <div v-if="nearestStation" class="info-box">
              <div class="info-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <div class="info-content">
                <span class="info-label">{{ t.nearestStationFound || 'Nearest Station' }}</span>
                <p class="info-title">{{ nearestStation.name }}</p>
                <p class="info-detail">{{ nearestStation.distance.toFixed(2) }} km away</p>
              </div>
            </div>

            <div v-if="store.busLocation.latitude" class="info-box bus-box">
              <div class="info-icon">
                <i class="fas fa-bus"></i>
              </div>
              <div class="info-content">
                <span class="info-label">{{ t.busLocation || 'Bus Location' }}</span>
                <p class="info-detail">{{ store.busLocation.latitude.toFixed(4) }}, {{ store.busLocation.longitude.toFixed(4) }}</p>
                <p v-if="store.busLocation.progress" class="progress-text">
                  {{ store.busLocation.progress }}% en route
                </p>
                <p v-if="store.busLocation.status === 'arrived'" class="arrived-text">
                  <i class="fas fa-check-circle"></i> Arrived!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Map Section -->
      <section class="map-section card">
        <BusMapFeature ref="busMapRef" />
      </section>

      <!-- Tracked Stations Card -->
      <section v-if="store.coordinates.length > 0" class="stations-card card">
        <div class="card-header">
          <h2>📍 {{ t.trackedStations || 'Tracked Stations' }}</h2>
          <span class="badge">{{ store.coordinates.length }}</span>
        </div>
        <div class="card-body">
          <div class="stations-list">
            <div v-for="(coordinate, index) in store.coordinates" :key="index" class="station-row">
              <div class="station-left">
                <i :class="coordinate.type === 'station' ? 'fas fa-building' : 'fas fa-map-pin'"></i>
                <div class="station-text">
                  <p class="station-name">{{ coordinate.name }}</p>
                  <p class="station-coords">{{ coordinate.lat.toFixed(4) }}, {{ coordinate.lng.toFixed(4) }}</p>
                </div>
              </div>
              <button 
                class="btn-remove" 
                @click="removeCoordinate(index)"
                title="Remove"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
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
import LanguageToggle from '../components/LanguageToggle.vue'
import BusMapFeature from '../components/BusMapFeature.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// State
const busMapRef = ref(null)
const nearestStation = ref(null)
const isTracking = ref(false)
const isTrackingBus = ref(false)

const goBack = () => {
  router.back()
}

// Track location and find nearest station
const handleTrackLocation = async () => {
  isTracking.value = true
  try {
    await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          store.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            address: 'Kigali, Rwanda'
          }
          resolve()
        },
        reject
      )
    })

    if (store.userLocation?.latitude) {
      const stops = findNearestStops(
        store.userLocation.latitude,
        store.userLocation.longitude,
        5
      )
      
      if (stops.length > 0) {
        const station = stops[0]
        nearestStation.value = station
        
        const stationLat = station.coordinates?.lat || station.latitude || -1.9473
        const stationLng = station.coordinates?.lng || station.longitude || 30.0567
        
        const existingIndex = store.coordinates.findIndex(c => c.name === station.name)
        if (existingIndex === -1) {
          store.coordinates.push({
            name: station.name,
            lat: stationLat,
            lng: stationLng,
            id: station.id,
            type: station.type,
            area: station.area || null
          })
        }
        console.log('✅ Located nearest station:', station.name)
      }
    }
  } catch (err) {
    console.error('Location error:', err)
  } finally {
    isTracking.value = false
  }
}

// Real-time bus tracking
const handleTrackBus = () => {
  if (isTrackingBus.value) {
    if (store.trackingIntervalId) {
      clearInterval(store.trackingIntervalId)
      store.trackingIntervalId = null
    }
    store.isTrackingBus = false
    store.busLocation = { latitude: null, longitude: null, lastUpdated: null }
    isTrackingBus.value = false
  } else {
    if (!nearestStation.value || !store.userLocation?.latitude) {
      alert('Please track location first')
      return
    }

    store.isTrackingBus = true
    isTrackingBus.value = true
    let progress = 0

    store.trackingIntervalId = setInterval(() => {
      if (nearestStation.value && store.userLocation) {
        progress += 0.05
        
        if (progress >= 1) {
          store.busLocation = {
            latitude: nearestStation.value.coordinates?.lat || nearestStation.value.latitude || -1.9473,
            longitude: nearestStation.value.coordinates?.lng || nearestStation.value.longitude || 30.0567,
            lastUpdated: new Date(),
            status: 'arrived'
          }
          clearInterval(store.trackingIntervalId)
          store.trackingIntervalId = null
          store.isTrackingBus = false
          isTrackingBus.value = false
          alert(`Bus arrived at ${nearestStation.value.name}!`)
        } else {
          const stationLat = nearestStation.value.coordinates?.lat || nearestStation.value.latitude || -1.9473
          const stationLng = nearestStation.value.coordinates?.lng || nearestStation.value.longitude || 30.0567
          
          const busLat = store.userLocation.latitude + (stationLat - store.userLocation.latitude) * progress
          const busLng = store.userLocation.longitude + (stationLng - store.userLocation.longitude) * progress
          
          store.busLocation = {
            latitude: busLat,
            longitude: busLng,
            lastUpdated: new Date(),
            progress: Math.round(progress * 100),
            status: 'in_transit'
          }
        }
      }
    }, 2000)
  }
}

// Remove tracked station
const removeCoordinate = (index) => {
  store.coordinates.splice(index, 1)
  console.log('Removed station at index:', index)
}

// Cleanup on unmount
onUnmounted(() => {
  if (store.trackingIntervalId) {
    clearInterval(store.trackingIntervalId)
    store.trackingIntervalId = null
  }
  store.isTrackingBus = false
  store.busLocation = { latitude: null, longitude: null, lastUpdated: null }
})

defineExpose({ busMapRef })
</script>


<style scoped>
.track-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F5E9 0%, var(--bg-primary) 60%);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0 16px;
  margin-bottom: 24px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #E8F5E9;
  border-color: #2E7D32;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

/* Card Base */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  background: #2E7D32;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.card-body {
  padding: 20px;
}

.description {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

/* Buttons */
.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #1976D2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1565C0;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.btn-accent {
  background: #FF6F00;
  color: white;
}

.btn-accent:hover:not(:disabled) {
  background: #F57C00;
  box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid #2E7D32;
}

.info-box.bus-box {
  border-left-color: #FF6F00;
}

.info-icon {
  font-size: 24px;
  color: #2E7D32;
  flex-shrink: 0;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-box.bus-box .info-icon {
  color: #FF6F00;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-title {
  margin: 4px 0 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.info-detail {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.progress-text {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #FF6F00;
  font-weight: 500;
}

.arrived-text {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #2E7D32;
  font-weight: 600;
}

/* Map Section */
.map-section {
  min-height: 450px;
}

/* Stations List */
.stations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid #7B1FA2;
}

.station-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.station-left i {
  font-size: 18px;
  color: #7B1FA2;
  flex-shrink: 0;
}

.station-text {
  flex: 1;
  min-width: 0;
}

.station-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.station-coords {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.btn-remove {
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

.btn-remove:hover {
  background: #FFCDD2;
  transform: scale(1.05);
}

/* Mobile */
.mobile-lang-toggle {
  display: none;
}

@media (max-width: 500px) {
  .container {
    padding: 0 12px 16px;
  }
  
  .page-header {
    padding: 16px 0 12px;
    margin-bottom: 16px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .btn {
    min-width: 120px;
    font-size: 13px;
    padding: 10px 12px;
  }
  
  .card-header {
    padding: 16px;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .map-section {
    min-height: 350px;
  }
  
  .station-row {
    padding: 12px;
  }
}
</style>
