<template>
  <div>
    <!-- Route Path Layer -->
    <l-layer-group v-if="showRoute && routePath.length > 0">
      <!-- Draw the route line -->
      <l-polyline
        :lat-lngs="routePath"
        :color="routeColor"
        :weight="routeWeight"
        :opacity="routeOpacity"
        :dash-array="dashArray"
      />
      
      <!-- Route markers (start and end) -->
      <l-marker
        v-if="startPoint"
        :lat-lng="[startPoint.lat, startPoint.lng]"
        :icon="startIcon"
      >
        <l-popup>
          <div class="route-popup">
            <h4>🚩 Your Location</h4>
            <p class="route-coords">{{ startPoint.lat.toFixed(4) }}, {{ startPoint.lng.toFixed(4) }}</p>
            <p v-if="startPoint.accuracy" class="route-accuracy">
              Accuracy: ±{{ Math.round(startPoint.accuracy) }}m
            </p>
          </div>
        </l-popup>
      </l-marker>

      <l-marker
        v-if="endPoint"
        :lat-lng="[endPoint.lat, endPoint.lng]"
        :icon="endIcon"
      >
        <l-popup>
          <div class="route-popup">
            <h4>🎯 Destination</h4>
            <p class="station-name">{{ endPoint.name }}</p>
            <p class="station-area">{{ endPoint.area }}</p>
            <p class="route-distance">{{ distance.toFixed(2) }} km away</p>
          </div>
        </l-popup>
      </l-marker>
    </l-layer-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LLayerGroup, LPolyline, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { Icon, type LatLngExpression } from 'leaflet'
import type { Station } from '../data/stations'
import type { UserLocation } from '../composables/useNearestStation'

// Props
interface Props {
  startPoint?: UserLocation | null
  endPoint?: Station | null
  distance?: number
  showRoute?: boolean
  routeColor?: string
  routeWeight?: number
  routeOpacity?: number
  dashArray?: string
}

const props = withDefaults(defineProps<Props>(), {
  showRoute: true,
  routeColor: '#1976D2',
  routeWeight: 4,
  routeOpacity: 0.7,
  dashArray: '10, 10'
})

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

// Custom start icon (green - user location)
const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom end icon (red - destination)
const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Generate route path (simple straight line for now - can be enhanced with real routing)
const routePath = computed(() => {
  if (!props.startPoint || !props.endPoint) {
    return []
  }

  // For now, create a simple straight line route
  // In a real implementation, you would use a routing service like OSRM
  return [
    [props.startPoint.lat, props.startPoint.lng],
    [props.endPoint.lat, props.endPoint.lng]
  ]
})

// Watch for route changes and log them
watch(routePath, (newPath) => {
  if (newPath.length > 0) {
    console.log('Route updated:', {
      from: props.startPoint,
      to: props.endPoint,
      distance: props.distance,
      path: newPath
    })
  }
}, { deep: true })
</script>

<style scoped>
.route-popup {
  min-width: 180px;
  text-align: center;
}

.route-popup h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.route-popup h4:first-child {
  color: #2E7D32;
}

.route-popup h4:last-child {
  color: #D32F2F;
}

.route-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.route-coords {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
}

.route-accuracy {
  color: #666;
}

.station-name {
  font-weight: 600;
  color: #333;
}

.station-area {
  color: #1976D2;
}

.route-distance {
  font-weight: 500;
  color: #D32F2F;
}

/* Leaflet popup styles */
:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:global(.leaflet-popup-content) {
  margin: 12px 16px;
}
</style>
