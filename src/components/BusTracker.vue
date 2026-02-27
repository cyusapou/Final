<template>
  <div>
    <!-- Bus Markers Layer -->
    <l-layer-group>
      <l-marker
        v-for="bus in busPositions"
        :key="bus.id"
        :lat-lng="[bus.lat, bus.lng]"
        :icon="busIcon"
      >
        <l-popup>
          <div class="bus-popup">
            <h4>🚌 Bus {{ bus.id }}</h4>
            <p class="bus-route">Route: {{ bus.route || 'Unknown' }}</p>
            <p class="bus-speed">Speed: {{ bus.speed || 0 }} km/h</p>
            <p class="bus-status">Status: {{ bus.status || 'Active' }}</p>
            <p class="bus-updated">Updated: {{ formatTime(bus.lastUpdated) }}</p>
            <button 
              class="track-btn"
              @click="handleTrackBus(bus)"
            >
              📍 Track This Bus
            </button>
          </div>
        </l-popup>
      </l-marker>
    </l-layer-group>

    <!-- User Location Marker (if available) -->
    <l-marker
      v-if="userLocation"
      :lat-lng="[userLocation.lat, userLocation.lng]"
      :icon="userIcon"
    >
      <l-popup>
        <div class="user-popup">
          <h4>📍 Your Location</h4>
          <p class="user-coords">{{ userLocation.lat.toFixed(4) }}, {{ userLocation.lng.toFixed(4) }}</p>
          <p v-if="userLocation.accuracy" class="user-accuracy">
            Accuracy: ±{{ Math.round(userLocation.accuracy) }}m
          </p>
        </div>
      </l-popup>
    </l-marker>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LMarker, LLayerGroup, LPopup } from '@vue-leaflet/vue-leaflet'
import { Icon } from 'leaflet'

// Interfaces
interface BusPosition {
  id: number
  lat: number
  lng: number
  route?: string
  speed?: number
  status?: string
  lastUpdated: Date
}

interface UserLocation {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: Date
}

// Props
interface Props {
  userLocation?: UserLocation | null
  onBusTrack?: (bus: BusPosition) => void
  enableSimulation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userLocation: null,
  onBusTrack: () => {},
  enableSimulation: true
})

// Reactive state
const busPositions = ref<BusPosition[]>([])
let updateInterval: number | null = null

// Fix for default Leaflet marker icons
const fixLeafletIcon = () => {
  delete (Icon.Default.prototype as any)._getIconUrl
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Initialize icon fix
fixLeafletIcon()

// Custom bus icon (blue)
const busIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom user location icon (red)
const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Initialize demo bus positions (simulate real buses in Kigali)
const initializeBusPositions = () => {
  const demoBuses: BusPosition[] = [
    {
      id: 101,
      lat: -1.9645,
      lng: 30.0723,
      route: 'Nyabugogo - Remera',
      speed: 25,
      status: 'Active',
      lastUpdated: new Date()
    },
    {
      id: 102,
      lat: -1.9433,
      lng: 30.0589,
      route: 'Kimironko - City Center',
      speed: 30,
      status: 'Active',
      lastUpdated: new Date()
    },
    {
      id: 103,
      lat: -1.9256,
      lng: 30.1034,
      route: 'Kicukiro - Kanombe',
      speed: 20,
      status: 'Active',
      lastUpdated: new Date()
    },
    {
      id: 104,
      lat: -1.9536,
      lng: 30.0867,
      route: 'Gatenga - Nyarugenge',
      speed: 35,
      status: 'Active',
      lastUpdated: new Date()
    }
  ]
  
  busPositions.value = demoBuses
}

// Simulate bus movement (for demo purposes)
const simulateBusMovement = () => {
  busPositions.value = busPositions.value.map(bus => {
    // Simulate small random movement
    const latDelta = (Math.random() - 0.5) * 0.001 // ~100m movement
    const lngDelta = (Math.random() - 0.5) * 0.001
    
    // Simulate speed changes
    const speedDelta = (Math.random() - 0.5) * 10
    const newSpeed = Math.max(5, Math.min(60, (bus.speed || 25) + speedDelta))
    
    return {
      ...bus,
      lat: bus.lat + latDelta,
      lng: bus.lng + lngDelta,
      speed: Math.round(newSpeed),
      lastUpdated: new Date()
    }
  })
}

// Format time for display
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Handle bus tracking click
const handleTrackBus = (bus: BusPosition) => {
  props.onBusTrack(bus)
}

// Start real-time updates
const startRealTimeUpdates = () => {
  if (!props.enableSimulation) return
  
  // Update every 3 seconds (simulating real-time data)
  updateInterval = window.setInterval(() => {
    simulateBusMovement()
  }, 3000)
}

// Stop real-time updates
const stopRealTimeUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

// Lifecycle hooks
onMounted(() => {
  initializeBusPositions()
  startRealTimeUpdates()
})

onUnmounted(() => {
  stopRealTimeUpdates()
})

// Expose methods for parent component
defineExpose({
  startRealTimeUpdates,
  stopRealTimeUpdates,
  busPositions: readonly(busPositions)
})
</script>

<style scoped>
.bus-popup {
  min-width: 180px;
  text-align: center;
}

.bus-popup h4 {
  margin: 0 0 8px 0;
  color: #1976D2;
  font-size: 14px;
  font-weight: 600;
}

.bus-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.bus-route {
  font-weight: 500;
  color: #333;
}

.bus-speed {
  color: #F57C00;
}

.bus-status {
  color: #2E7D32;
  font-weight: 500;
}

.bus-updated {
  color: #666;
  font-style: italic;
}

.track-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #1976D2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.track-btn:hover {
  background: #1565C0;
}

.user-popup {
  min-width: 160px;
  text-align: center;
}

.user-popup h4 {
  margin: 0 0 8px 0;
  color: #D32F2F;
  font-size: 14px;
  font-weight: 600;
}

.user-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.user-coords {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}

.user-accuracy {
  color: #666;
}

/* Leaflet popup styles */
:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:global(.leaflet-popup-content) {
  margin: 12px 16px;
}
</style>
