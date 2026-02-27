<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen destination-screen">
      <div class="header">
        <button class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.selectDestination }}</h2>
      </div>

      <!-- Split Layout: Departure (Left) and Destination (Right) -->
      <div class="split-container">
        
        <!-- LEFT PANEL: Departure / Origin -->
        <div class="split-panel departure-panel">
          <div class="panel-header">
            <div class="panel-icon departure-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="panel-title">
              <h3>{{ t.whereBoarding }}</h3>
              <p v-if="store.selectedOriginStop">{{ store.selectedOriginStop.name }}</p>
              <p v-else class="placeholder-text">{{ t.whereBoarding }}</p>
            </div>
            <button v-if="store.selectedOriginStop" class="btn-change" @click="clearOrigin">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="panel-content" v-if="!store.selectedOriginStop">
            <!-- City Selector for Departure -->
            <div class="city-selector">
              <select v-model="originCity" class="city-select">
                <option value="Kigali">Kigali</option>
                <option value="Musanze">Musanze</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Huye">Huye</option>
                <option value="Rusizi">Rusizi</option>
                <option value="Muhanga">Muhanga</option>
                <option value="Ruhengeri">Ruhengeri</option>
                <option value="Butare">Butare</option>
                <option value="Kibuye">Kibuye</option>
              </select>
            </div>

            <!-- Search Bar for Departure -->
            <div class="search-bar">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="originSearch" 
                :placeholder="t.searchStop"
                class="search-input"
              >
              <button v-if="originSearch" class="clear-search" @click="originSearch = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Stop Type Filter -->
            <div class="stop-type-filter">
              <button 
                :class="['filter-btn', { active: originTypeFilter === 'all' }]"
                @click="originTypeFilter = 'all'"
              >
                All
              </button>
              <button 
                :class="['filter-btn', { active: originTypeFilter === 'station' }]"
                @click="originTypeFilter = 'station'"
              >
                <i class="fas fa-building"></i> {{ t.station }}
              </button>
              <button 
                :class="['filter-btn', { active: originTypeFilter === 'roadside' }]"
                @click="originTypeFilter = 'roadside'"
              >
                <i class="fas fa-bus"></i> {{ t.roadside }}
              </button>
            </div>

            <!-- Stops List for Departure -->
            <div class="stops-list">
              <div 
                v-for="stop in filteredOriginStops" 
                :key="stop.id"
                class="stop-card"
                @click="selectOriginStop(stop)"
              >
                <div class="stop-icon" :class="stop.type">
                  <i :class="stop.type === 'station' ? 'fas fa-building' : 'fas fa-bus'"></i>
                </div>
                <div class="stop-info">
                  <h3>{{ stop.name }}</h3>
                  <div class="stop-meta">
                    <span class="stop-type-badge" :class="stop.type">
                      {{ stop.type === 'station' ? t.station : t.roadside }}
                    </span>
                    <span v-if="stop.code" class="stop-code">
                      <i class="fas fa-qrcode"></i> {{ stop.code }}
                    </span>
                  </div>
                  <p v-if="stop.area" class="stop-area">{{ stop.area }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredOriginStops.length === 0" class="empty-state">
              <i class="fas fa-map-marker-alt"></i>
              <p>{{ t.noResults }}</p>
            </div>
          </div>

          <!-- Selected Origin Display -->
          <div class="selected-stop" v-else>
            <div class="selected-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="selected-details">
              <h4>{{ store.selectedOriginStop.name }}</h4>
              <p v-if="store.selectedOriginStop.area">{{ store.selectedOriginStop.area }}</p>
              <span class="stop-type-badge" :class="store.selectedOriginStop.type">
                {{ store.selectedOriginStop.type === 'station' ? t.station : t.roadside }}
              </span>
            </div>
          </div>
        </div>

        <!-- DIVIDER -->
        <div class="split-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">
            <i class="fas fa-exchange-alt"></i>
          </div>
          <div class="divider-line"></div>
        </div>

        <!-- RIGHT PANEL: Destination -->
        <div class="split-panel destination-panel">
          <div class="panel-header">
            <div class="panel-icon destination-icon">
              <i class="fas fa-map-marker"></i>
            </div>
            <div class="panel-title">
              <h3>{{ t.whereGettingOff }}</h3>
              <p v-if="store.selectedDestinationStop">{{ store.selectedDestinationStop.name }}</p>
              <p v-else class="placeholder-text">{{ t.whereGettingOff }}</p>
            </div>
            <button v-if="store.selectedDestinationStop" class="btn-change" @click="clearDestination">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="panel-content" v-if="!store.selectedDestinationStop">
            <!-- City Selector for Destination -->
            <div class="city-selector">
              <select v-model="destCity" class="city-select">
                <option value="Kigali">Kigali</option>
                <option value="Musanze">Musanze</option>
                <option value="Rubavu">Rubavu</option>
                <option value="Huye">Huye</option>
                <option value="Rusizi">Rusizi</option>
                <option value="Muhanga">Muhanga</option>
                <option value="Ruhengeri">Ruhengeri</option>
                <option value="Butare">Butare</option>
                <option value="Kibuye">Kibuye</option>
              </select>
            </div>

            <!-- Search Bar for Destination -->
            <div class="search-bar">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                v-model="destSearch" 
                :placeholder="t.searchStop"
                class="search-input"
              >
              <button v-if="destSearch" class="clear-search" @click="destSearch = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Stop Type Filter -->
            <div class="stop-type-filter">
              <button 
                :class="['filter-btn', { active: destTypeFilter === 'all' }]"
                @click="destTypeFilter = 'all'"
              >
                All
              </button>
              <button 
                :class="['filter-btn', { active: destTypeFilter === 'station' }]"
                @click="destTypeFilter = 'station'"
              >
                <i class="fas fa-building"></i> {{ t.station }}
              </button>
              <button 
                :class="['filter-btn', { active: destTypeFilter === 'roadside' }]"
                @click="destTypeFilter = 'roadside'"
              >
                <i class="fas fa-bus"></i> {{ t.roadside }}
              </button>
            </div>

            <!-- Stops List for Destination -->
            <div class="stops-list">
              <div 
                v-for="stop in filteredDestStops" 
                :key="stop.id"
                class="stop-card"
                @click="selectDestStop(stop)"
              >
                <div class="stop-icon" :class="stop.type">
                  <i :class="stop.type === 'station' ? 'fas fa-building' : 'fas fa-bus'"></i>
                </div>
                <div class="stop-info">
                  <h3>{{ stop.name }}</h3>
                  <div class="stop-meta">
                    <span class="stop-type-badge" :class="stop.type">
                      {{ stop.type === 'station' ? t.station : t.roadside }}
                    </span>
                    <span v-if="stop.code" class="stop-code">
                      <i class="fas fa-qrcode"></i> {{ stop.code }}
                    </span>
                  </div>
                  <p v-if="stop.area" class="stop-area">{{ stop.area }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredDestStops.length === 0" class="empty-state">
              <i class="fas fa-map-marker-alt"></i>
              <p>{{ t.noResults }}</p>
            </div>
          </div>

          <!-- Selected Destination Display -->
          <div class="selected-stop" v-else>
            <div class="selected-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="selected-details">
              <h4>{{ store.selectedDestinationStop.name }}</h4>
              <p v-if="store.selectedDestinationStop.area">{{ store.selectedDestinationStop.area }}</p>
              <span class="stop-type-badge" :class="store.selectedDestinationStop.type">
                {{ store.selectedDestinationStop.type === 'station' ? t.station : t.roadside }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="continue-section" v-if="store.selectedOriginStop && store.selectedDestinationStop">
        <button class="btn-continue" @click="goToSummary">
          {{ t.continue }} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store, stops } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// Origin (Departure) State
const originCity = ref('Kigali')
const originSearch = ref('')
const originTypeFilter = ref('all')

// Destination State
const destCity = ref('Kigali')
const destSearch = ref('')
const destTypeFilter = ref('all')

// Filtered stops for origin
const filteredOriginStops = computed(() => {
  let result = stops.filter(s => s.city === originCity.value)
  
  if (originTypeFilter.value !== 'all') {
    result = result.filter(s => s.type === originTypeFilter.value)
  }
  
  if (originSearch.value) {
    const query = originSearch.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.area && s.area.toLowerCase().includes(query))
    )
  }
  
  return result
})

// Filtered stops for destination
const filteredDestStops = computed(() => {
  let result = stops.filter(s => s.city === destCity.value)
  
  if (destTypeFilter.value !== 'all') {
    result = result.filter(s => s.type === destTypeFilter.value)
  }
  
  if (destSearch.value) {
    const query = destSearch.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.area && s.area.toLowerCase().includes(query))
    )
  }
  
  return result
})

const clearOrigin = () => {
  store.selectedOriginStop = null
}

const clearDestination = () => {
  store.selectedDestinationStop = null
}

const selectOriginStop = (stop) => {
  store.selectedOriginStop = stop
}

const selectDestStop = (stop) => {
  store.selectedDestinationStop = stop
}

const goBack = () => {
  router.push('/express')
}

const goToSummary = () => {
  router.push('/summary')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page-wrapper {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #F5F5F5;
}

.mobile-lang-toggle {
  display: block;
}

@media (min-width: 500px) {
  .mobile-lang-toggle {
    display: none;
  }
}

.screen {
  min-height: 100vh;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .screen {
    padding: 24px 32px;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-top: 16px;
}

.header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
}

@media (min-width: 1024px) {
  .header h2 {
    font-size: 22px;
  }
}

.btn-back {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  color: #424242;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #E8F5E9;
  color: #2E7D32;
}

/* Split Container */
.split-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 1024px) {
  .split-container {
    flex-direction: row;
    gap: 0;
  }
}

/* Split Panels */
.split-panel {
  background: #FFF;
  border-radius: 16px;
  padding: 20px;
  flex: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .split-panel {
    flex: 1;
    min-height: calc(100vh - 250px);
  }
}

.departure-panel {
  border: 2px solid #E8E8E8;
}

.destination-panel {
  border: 2px solid #E8E8E8;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E8E8E8;
  margin-bottom: 16px;
}

.panel-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.departure-icon {
  background: #E3F2FD;
  color: #1976D2;
}

.destination-icon {
  background: #FFF3E0;
  color: #F57C00;
}

.panel-title {
  flex: 1;
}

.panel-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px 0;
}

.panel-title p {
  font-size: 14px;
  color: #2E7D32;
  margin: 0;
  font-weight: 500;
}

.panel-title .placeholder-text {
  color: #9E9E9E;
  font-weight: 400;
}

.btn-change {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  color: #757575;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-change:hover {
  background: #FFEBEE;
  color: #D32F2F;
  border-color: #D32F2F;
}

/* Panel Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
}

/* City Selector */
.city-selector {
  margin-bottom: 16px;
}

.city-selector label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #424242;
  margin-bottom: 6px;
}

.city-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  background: #FFF;
  color: #212121;
}

/* Search Bar */
.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-bar i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 14px 40px 14px 42px;
  border: 1.5px solid #E8E8E8;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: #FFF;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.clear-search {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 4px;
}

/* Stop Type Filter */
.stop-type-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  background: #FFF;
  font-size: 12px;
  color: #757575;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #2E7D32;
}

.filter-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

/* Stops List */
.stops-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.stop-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #FFF;
  border: 1.5px solid #E8E8E8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.stop-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stop-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.stop-icon.station {
  background: #E3F2FD;
  color: #1976D2;
}

.stop-icon.roadside {
  background: #FFF3E0;
  color: #F57C00;
}

.stop-info {
  flex: 1;
  min-width: 0;
}

.stop-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px 0;
}

.stop-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.stop-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
}

.stop-type-badge.station {
  background: #E3F2FD;
  color: #1976D2;
}

.stop-type-badge.roadside {
  background: #FFF3E0;
  color: #F57C00;
}

.stop-code {
  font-size: 11px;
  color: #757575;
}

.stop-area {
  font-size: 12px;
  color: #9E9E9E;
  margin: 0;
}

/* Selected Stop */
.selected-stop {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #E8F5E9;
  border-radius: 12px;
  margin-top: auto;
}

.selected-icon {
  font-size: 32px;
  color: #2E7D32;
}

.selected-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px 0;
}

.selected-details p {
  font-size: 13px;
  color: #757575;
  margin: 0 0 8px 0;
}

/* Split Divider */
.split-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .split-divider {
    flex-direction: column;
    padding: 0 20px;
    justify-content: center;
  }
}

.divider-line {
  height: 2px;
  width: 60px;
  background: #E8E8E8;
}

@media (min-width: 1024px) {
  .divider-line {
    width: 2px;
    height: 60px;
  }
}

.divider-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2E7D32;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

@media (min-width: 1024px) {
  .divider-icon {
    margin: 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #757575;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E8E8E8;
}

.empty-state p {
  font-size: 15px;
}

/* Continue Button */
.continue-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E8E8E8;
}

.btn-continue {
  width: 100%;
  padding: 16px 24px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-continue:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

/* Mobile adjustments */
@media (max-width: 499px) {
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
  
  .page-wrapper {
    padding-bottom: 70px;
  }
  
  .split-panel {
    min-height: 400px;
  }
}
</style>
