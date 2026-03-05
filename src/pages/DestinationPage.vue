<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress :current="1" :total="3" />
    
    <div class="screen destination-screen">
      <div class="header">
        <button class="btn-back" @click="goBack">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t('selectDestination') }}</h2>
      </div>

      <!-- Search Box -->
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('searchDestination')"
          class="stop-input"
          @input="filterStops"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Destination stops list - shown when no destination selected yet -->
      <div v-if="!selectedDestination && !loading && !error" class="stops-section">
        <ul v-if="filteredStops.length" class="stop-list">
          <li
            v-for="stop in filteredStops"
            :key="stop.id"
            class="stop-item"
            @click="selectDestination(stop)"
          >
            <div class="stop-icon">
              <i :class="stop.type === 'station' ? 'fas fa-building' : 'fas fa-bus'"></i>
            </div>
            <div class="stop-info">
              <span class="stop-name">{{ stop.name }}</span>
              <span class="stop-meta">
                <span v-if="stop.code" class="stop-code">{{ stop.code }}</span>
                <span v-if="stop.area" class="stop-area">{{ stop.area }}</span>
              </span>
            </div>
            <span class="stop-type-badge" :class="stop.type">
              {{ stop.type === 'station' ? t('station') : t('roadside') }}
            </span>
          </li>
        </ul>

        <!-- Empty state when no search results -->
        <div v-else-if="searchQuery" class="empty-state">
          <i class="fas fa-search"></i>
          <p>{{ t('noResults') }}</p>
          <p class="empty-hint">Try searching with a different query</p>
        </div>

        <!-- Start typing hint -->
        <div v-else class="empty-state">
          <i class="fas fa-map-marker-alt"></i>
          <p>{{ t('searchDestination') }}</p>
          <p class="empty-hint">Type to find your destination</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('findingNearestStop') || 'Finding nearest stop to you...' }}</p>
      </div>

      <!-- Error state -->
      <div v-if="error && !loading" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button v-if="selectedDestination" class="btn-retry" @click="retryFindStop">
          {{ t('tryAgain') || 'Try Again' }}
        </button>
      </div>

      <!-- Nearest stop card - shown after selection and retrieval -->
      <NearestStopCard
        v-if="nearestStop && !loading && selectedDestination"
        :stop="nearestStop"
        :destination="selectedDestination"
        :alternatives="alternatives"
        @confirm="confirmAndProceed"
        @change="clearSelection"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store, stops } from '../store/index.js'
import { translations } from '../translations/index.js'
import { useSmartStop } from '../composables/useSmartStop.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'
import NearestStopCard from '../components/NearestStopCard.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)

// Translation helper
const t = (key) => {
  const trans = translations[currentLang.value]
  return trans && trans[key] ? trans[key] : translations['en'][key] || key
}

// Smart stop composable
const { nearestStop, alternatives, loading, error, findNearestStop, clearSelection: clearSmartStop } = useSmartStop()

// Local state
const searchQuery = ref('')
const selectedDestination = ref(null)
const lastDestinationId = ref(null)

// Filter stops based on search query
const filteredStops = computed(() => {
  if (!searchQuery.value) return []
  
  const q = searchQuery.value.toLowerCase()
  return stops.filter(s => 
    s.name.toLowerCase().includes(q) || 
    (s.code && s.code.includes(q)) ||
    (s.area && s.area.toLowerCase().includes(q))
  ).slice(0, 12) // Limit to 12 results
})

// Go back to previous page
function goBack() {
  router.back()
}

// Handle destination selection
async function selectDestination(stop) {
  selectedDestination.value = stop
  searchQuery.value = stop.name
  lastDestinationId.value = stop.id

  // Immediately find nearest stop
  try {
    await findNearestStop(stop.id)
  } catch (err) {
    // Error is already set in the composable
    console.error('Failed to find nearest stop:', err)
  }
}

// Retry finding the nearest stop
function retryFindStop() {
  if (lastDestinationId.value) {
    findNearestStop(lastDestinationId.value)
  }
}

// Clear the selection and start over
function clearSelection() {
  selectedDestination.value = null
  nearestStop.value = null
  searchQuery.value = ''
  clearSmartStop()
}

// Confirm and proceed to trips page
function confirmAndProceed() {
  if (nearestStop.value && selectedDestination.value) {
    // Save both resolved origin and destination to store
    store.selectedOriginStop = nearestStop.value
    store.selectedDestinationStop = selectedDestination.value
    
    // Also save the auto-resolved origin flag
    store.autoResolvedOrigin = true
    
    router.push('/trips')
  }
}

// Watch for search input changes
function filterStops() {
  // The computed property handles filtering
  // Reset selected destination when user modifies search
  if (selectedDestination.value && selectedDestination.value.name !== searchQuery.value) {
    selectedDestination.value = null
    clearSmartStop()
  }
}
</script>

<style scoped>
.page-wrapper {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-secondary);
}

.mobile-lang-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
}

.screen {
  padding: 0;
  margin: 0;
}

.destination-screen {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100vh;
}

@media (min-width: 768px) {
  .destination-screen {
    max-width: 600px;
    margin: 0 auto;
    padding: 12px;
  }
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.btn-back {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.btn-back:hover {
  background: var(--bg-tertiary);
}

.header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .header h2 {
    font-size: 1.1rem;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-primary);
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

@media (min-width: 768px) {
  .search-box {
    padding: 8px 10px;
  }
  
  .search-box i {
    font-size: 0.95rem;
  }
  
  .stop-input {
    font-size: 0.9rem;
  }
}

.search-box i {
  color: var(--text-tertiary);
  font-size: 1.1rem;
}

.stop-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.stop-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: var(--text-secondary);
}

/* Stops List */
.stops-section {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.stop-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

@media (min-width: 768px) {
  .stop-item {
    padding: 10px;
    gap: 10px;
  }
  
  .stop-icon {
    width: 36px;
    height: 36px;
  }
  
  .stop-name {
    font-size: 0.9rem;
  }
  
  .stop-meta {
    font-size: 0.75rem;
  }
}

.stop-item:hover {
  border-color: var(--primary-green);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--primary-green-bg) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stop-item:active {
  transform: scale(0.98);
}

.stop-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  color: var(--primary-green);
}

.stop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stop-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stop-meta {
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.stop-code {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 3px;
  color: #666;
}

.stop-area {
  color: var(--text-secondary);
}

.stop-type-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: capitalize;
}

.stop-type-badge.station {
  background: #e3f2fd;
  color: #1976d2;
}

.stop-type-badge.roadside {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-tertiary);
}

.empty-state i {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 4px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 12px;
  background: #ffebee;
  border-radius: 12px;
  margin-top: 16px;
}

.error-state i {
  font-size: 2rem;
  color: #d32f2f;
}

.error-state p {
  color: #c62828;
  font-size: 0.95rem;
  margin: 0;
  text-align: center;
}

.btn-retry {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-top: 8px;
}

.btn-retry:hover {
  background: #c62828;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .destination-screen {
    padding: 12px;
  }

  .header {
    margin-bottom: 12px;
  }

  .header h2 {
    font-size: 1.1rem;
  }

  .stop-item {
    padding: 10px;
  }
}
</style>
