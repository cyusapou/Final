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
        <h2>{{ isSelectingOrigin ? t.whereBoarding : t.whereGettingOff }}</h2>
      </div>

      <p class="screen-desc">
        {{ isSelectingOrigin ? t.whereBoarding : t.chooseDestination }}
      </p>

      <!-- City/Region Selector -->
      <div class="city-selector">
        <label>{{ t.selectDestination }}</label>
        <select v-model="selectedCity" class="city-select">
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

      <!-- Mode Toggle: Search vs Code -->
      <div class="mode-toggle" v-if="selectedCity === 'Kigali'">
        <button 
          :class="['mode-btn', { active: inputMode === 'search' }]"
          @click="inputMode = 'search'"
        >
          <i class="fas fa-search"></i>
          {{ t.searchStop }}
        </button>
        <button 
          :class="['mode-btn', { active: inputMode === 'code' }]"
          @click="inputMode = 'code'"
        >
          <i class="fas fa-qrcode"></i>
          {{ t.enterStopCode }}
        </button>
      </div>

      <!-- Stop Code Input (Kigali only) -->
      <div v-if="inputMode === 'code' && selectedCity === 'Kigali'" class="code-input-section">
        <div class="code-input-wrapper">
          <input 
            type="text" 
            v-model="stopCodeInput" 
            maxlength="4"
            placeholder="1234"
            class="code-input"
            @input="validateCode"
          />
          <button class="btn-lookup" @click="lookupCode" :disabled="stopCodeInput.length !== 4">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        <p v-if="codeError" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          {{ t.invalidStopCode }}
        </p>
        <p v-if="resolvedStop" class="success-message">
          <i class="fas fa-check-circle"></i>
          {{ resolvedStop.name }} - {{ resolvedStop.area }}
        </p>
      </div>

      <!-- Search Bar (when not using code) -->
      <div v-else class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t.searchStop"
          class="search-input"
        >
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Stop Type Filter -->
      <div class="stop-type-filter" v-if="inputMode === 'search'">
        <button 
          :class="['filter-btn', { active: stopTypeFilter === 'all' }]"
          @click="stopTypeFilter = 'all'"
        >
          All
        </button>
        <button 
          :class="['filter-btn', { active: stopTypeFilter === 'station' }]"
          @click="stopTypeFilter = 'station'"
        >
          <i class="fas fa-building"></i> {{ t.station }}
        </button>
        <button 
          :class="['filter-btn', { active: stopTypeFilter === 'roadside' }]"
          @click="stopTypeFilter = 'roadside'"
        >
          <i class="fas fa-bus"></i> {{ t.roadside }}
        </button>
      </div>

      <!-- Stops List (when using search) -->
      <div v-if="inputMode === 'search'" class="stops-grid">
        <div 
          v-for="stop in filteredStops" 
          :key="stop.id"
          class="stop-card"
          @click="selectStop(stop)"
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
      <div v-if="inputMode === 'search' && filteredStops.length === 0" class="empty-state">
        <i class="fas fa-map-marker-alt"></i>
        <p>{{ t.noResults }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store, stops, findStopByCode } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// State
const isSelectingOrigin = computed(() => !store.selectedOriginStop)
const selectedCity = ref('Kigali')
const inputMode = ref('search')
const searchQuery = ref('')
const stopTypeFilter = ref('all')
const stopCodeInput = ref('')
const codeError = ref(false)
const resolvedStop = ref(null)

// Filtered stops based on search/city/type
const filteredStops = computed(() => {
  let result = stops.filter(s => s.city === selectedCity.value)
  
  // Apply type filter
  if (stopTypeFilter.value !== 'all') {
    result = result.filter(s => s.type === stopTypeFilter.value)
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.area && s.area.toLowerCase().includes(query))
    )
  }
  
  return result
})

// Watch for city change to reset resolved stop
watch(selectedCity, () => {
  resolvedStop.value = null
  codeError.value = false
  stopCodeInput.value = ''
})

const validateCode = (e) => {
  // Only allow numeric
  stopCodeInput.value = e.target.value.replace(/\D/g, '')
  codeError.value = false
  resolvedStop.value = null
}

const lookupCode = () => {
  if (stopCodeInput.value.length !== 4) return
  
  const found = findStopByCode(stopCodeInput.value)
  if (found && found.city === selectedCity.value) {
    resolvedStop.value = found
    codeError.value = false
  } else {
    codeError.value = true
    resolvedStop.value = null
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const goBack = () => {
  if (isSelectingOrigin.value) {
    router.push('/trips')
  } else {
    // Go back to origin selection
    store.selectedDestinationStop = null
  }
}

const selectStop = (stop) => {
  if (isSelectingOrigin.value) {
    store.selectedOriginStop = stop
    // Now select destination
  } else {
    store.selectedDestinationStop = stop
    router.push('/summary')
  }
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

/* Desktop sidebar spacing */
@media (min-width: 500px) {
  .page-wrapper {
    margin-left: 0;
  }
  
  .mobile-lang-toggle {
    display: none;
  }
}

.screen {
  min-height: 100vh;
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
}

/* Desktop: Add padding */
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

/* Desktop: Larger header */
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

.screen-desc {
  font-size: 14px;
  color: #757575;
  margin-bottom: 20px;
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

/* Mode Toggle */
.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  background: #FFF;
  color: #757575;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #2E7D32;
}

/* Code Input */
.code-input-section {
  margin-bottom: 20px;
}

.code-input-wrapper {
  display: flex;
  gap: 8px;
}

.code-input {
  flex: 1;
  padding: 14px;
  border: 2px solid #E8E8E8;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 8px;
}

.code-input:focus {
  outline: none;
  border-color: #2E7D32;
}

.btn-lookup {
  width: 50px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
}

.btn-lookup:disabled {
  background: #E8E8E8;
  color: #757575;
  cursor: not-allowed;
}

.error-message {
  color: #D32F2F;
  font-size: 13px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.success-message {
  color: #2E7D32;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
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
  border-radius: 20px;
  background: #FFF;
  color: #757575;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

/* Stops Grid */
.stops-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .stops-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stop-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #FFF;
  border-radius: 10px;
  border: 1.5px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.stop-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.stop-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stop-icon.station {
  background: #E8F5E9;
  color: #2E7D32;
}

.stop-icon.roadside {
  background: #FFF3E0;
  color: #F57C00;
}

.stop-info {
  flex: 1;
}

.stop-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
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
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.stop-type-badge.station {
  background: #E8F5E9;
  color: #2E7D32;
}

.stop-type-badge.roadside {
  background: #FFF3E0;
  color: #F57C00;
}

.stop-code {
  font-size: 11px;
  font-weight: 600;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stop-area {
  font-size: 12px;
  color: #9E9E9E;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
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

/* Mobile adjustments */
@media (max-width: 600px) {
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
}
</style>
