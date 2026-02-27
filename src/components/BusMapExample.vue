<template>
  <div class="bus-map-example">
    <h2>🚌 Bus Map Feature - Usage Example</h2>
    <p>This is a simple example of how to use the BusMapFeature component:</p>
    
    <!-- Basic Usage -->
    <div class="example-section">
      <h3>Basic Usage</h3>
      <pre><code>&lt;BusMapFeature /&gt;</code></pre>
      
      <div class="demo-map">
        <BusMapFeature />
      </div>
    </div>

    <!-- Advanced Usage with Refs -->
    <div class="example-section">
      <h3>Advanced Usage</h3>
      <pre><code>&lt;template&gt;
  &lt;BusMapFeature ref="busMapRef" /&gt;
  &lt;button @click="findNearest"&gt;Find Nearest Station&lt;/button&gt;
&lt;/template&gt;

&lt;script setup&gt;
import { ref } from 'vue'
import BusMapFeature from './BusMapFeature.vue'

const busMapRef = ref(null)

const findNearest = () => {
  busMapRef.value?.handleFindNearestStation()
}
&lt;/script&gt;</code></pre>
    </div>

    <!-- Features -->
    <div class="example-section">
      <h3>🚀 Features</h3>
      <ul>
        <li>📍 <strong>Find Nearest Station</strong>: Uses browser geolocation + Turf.js for accurate distance calculations</li>
        <li>🗺️ <strong>Interactive Map</strong>: OpenStreetMap tiles with Leaflet (completely free)</li>
        <li>🚌 <strong>Real-time Bus Tracking</strong>: Simulated bus positions with live updates</li>
        <li>🎯 <strong>Station Markers</strong>: Clickable markers with popups and zoom functionality</li>
        <li>📱 <strong>Mobile Responsive</strong>: Works perfectly on mobile devices</li>
        <li>🌍 <strong>Kigali-focused</strong>: Pre-loaded with real Kigali bus stations</li>
      </ul>
    </div>

    <!-- Installation -->
    <div class="example-section">
      <h3>📦 Installation</h3>
      <pre><code>npm install leaflet @vue-leaflet/vue-leaflet @turf/turf</code></pre>
      
      <p>Add to main.js:</p>
      <pre><code>import 'leaflet/dist/leaflet.css'</code></pre>
    </div>
  </div>
</template>

<script setup>
import BusMapFeature from './BusMapFeature.vue'
</script>

<style scoped>
.bus-map-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.bus-map-example h2 {
  color: #2E7D32;
  margin-bottom: 16px;
}

.example-section {
  margin: 32px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.example-section h3 {
  color: #1976D2;
  margin-bottom: 12px;
}

.demo-map {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

pre {
  background: #f1f3f4;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.4;
}

code {
  font-family: 'Monaco', 'Courier New', monospace;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

ul li:last-child {
  border-bottom: none;
}

ul li strong {
  color: #2E7D32;
}
</style>
