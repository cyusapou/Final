<template>
  <div>
    <!-- Station Markers Layer -->
    <l-layer-group>
      <l-marker
        v-for="station in stations"
        :key="station.id"
        :lat-lng="[station.lat, station.lng]"
        :icon="stationIcon"
        @click="handleStationClick(station)"
      >
        <l-popup>
          <div class="station-popup">
            <h4>{{ station.name }}</h4>
            <p class="station-type">{{ station.type === 'station' ? 'Bus Station' : 'Bus Stop' }}</p>
            <p v-if="station.area" class="station-area"><i class="fas fa-map-marker-alt"></i> {{ station.area }}</p>
            <button 
              class="zoom-btn"
              @click="zoomToStation(station)"
            >
              <i class="fas fa-search-location"></i> Zoom to Station
            </button>
          </div>
        </l-popup>
      </l-marker>
    </l-layer-group>
  </div>
</template>

<script setup lang="ts">
import { LMarker, LLayerGroup, LPopup } from '@vue-leaflet/vue-leaflet'
import { Icon, type LatLngExpression } from 'leaflet'
import type { Station } from '../data/stations'
import { stations } from '../data/stations'

// Props
interface Props {
  onStationClick?: (station: Station) => void
  onZoomToStation?: (station: Station) => void
}

const props = withDefaults(defineProps<Props>(), {
  onStationClick: () => {},
  onZoomToStation: () => {}
})

// Fix for default Leaflet marker icons
// This is needed because webpack/vite doesn't handle the icon images correctly
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

// Custom station icon (green for stations, orange for stops)
const stationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Handle station marker click
const handleStationClick = (station: Station) => {
  props.onStationClick(station)
}

// Zoom to specific station
const zoomToStation = (station: Station) => {
  props.onZoomToStation(station)
}
</script>

<style scoped>
.station-popup {
  min-width: 200px;
  text-align: center;
}

.station-popup h4 {
  margin: 0 0 8px 0;
  color: #2E7D32;
  font-size: 14px;
  font-weight: 600;
}

.station-popup p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.station-type {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.station-area {
  color: #1976D2;
}

.zoom-btn {
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

.zoom-btn:hover {
  background: #1B5E20;
}

/* Leaflet popup styles */
:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:global(.leaflet-popup-content) {
  margin: 12px 16px;
}
</style>

<style>
/* Dark mode overrides */
html.dark .station-popup h4 {
  color: var(--green);
}

html.dark .station-popup p {
  color: var(--text-muted);
}

html.dark .station-area {
  color: var(--text-muted);
}

html.dark .zoom-btn {
  background: var(--green);
  color: #fff;
}

html.dark .zoom-btn:hover {
  background: var(--green);
  filter: brightness(1.15);
}

html.dark .leaflet-popup-content-wrapper {
  background: var(--surface);
  color: var(--text);
}

html.dark .leaflet-popup-tip {
  background: var(--surface);
}
</style>
