 <template>
  <div class="track-page">
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
  padding: 0 16px 20px;
}

/* Mobile: Language toggle */
.mobile-lang-toggle {
  display: none;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 499px) {
  .mobile-lang-toggle {
    display: block;
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
    padding: 0;
    border: none;
  }
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 16px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-back:active {
  transform: scale(0.95);
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
}

/* Card Section */
.card {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
}

/* Map Section */
.map-section {
  min-height: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 18px;
  }
  
  .map-section {
    min-height: 350px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px 16px;
  }
  
  .page-header {
    padding: 12px 0;
    margin-bottom: 12px;
  }
  
  .btn-back {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .page-header h1 {
    font-size: 16px;
  }
  
  .map-section {
    min-height: 300px;
  }
}

/* Desktop: max width constraint */
@media (min-width: 500px) {
  .mobile-lang-toggle {
    display: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .track-page {
    background: linear-gradient(180deg, #1B5E20 0%, var(--bg-primary) 60%);
  }
}
</style>
