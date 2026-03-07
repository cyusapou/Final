<template>
  <div class="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
    <StepProgress :current="1" :total="3" />
    
    <div class="p-4 md:p-3 md:max-w-2xl md:mx-auto flex flex-col gap-3 min-h-screen">
      <div class="flex items-center gap-3 mb-2">
        <button 
          @click="goBack"
          class="p-2 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <i class="fas fa-arrow-left text-lg text-gray-900 dark:text-gray-100"></i>
        </button>
        <h2 class="text-xl md:text-lg font-bold text-gray-900 dark:text-gray-100">
          {{ t('selectDestination') }}
        </h2>
      </div>

      <!-- Search Box -->
      <div class="flex items-center gap-2.5 bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 rounded-xl p-2.5 md:p-2">
        <i class="fas fa-search text-gray-400 dark:text-gray-500 text-lg md:text-base"></i>
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('searchDestination')"
          class="flex-1 bg-transparent border-none outline-none text-base md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-inherit"
          @input="filterStops"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''"
          class="p-1 bg-transparent border-none text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Destination stops list -->
      <div v-if="!selectedDestination && !loading && !error" class="flex-1 overflow-y-auto p-0">
        <ul v-if="filteredStops.length" class="list-none p-0 m-0 flex flex-col gap-2">
          <li
            v-for="stop in filteredStops"
            :key="stop.id"
            class="flex items-center gap-3 p-3 md:p-2.5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg cursor-pointer transition-all hover:border-green-600 hover:bg-gradient-to-r hover:from-white hover:to-green-50 dark:hover:from-neutral-800 dark:hover:to-neutral-700 hover:shadow-lg active:scale-95"
            @click="selectDestination(stop)"
          >
            <div class="flex-shrink-0 w-10 h-10 md:w-9 md:h-9 flex items-center justify-center bg-gray-100 dark:bg-neutral-700 rounded-lg text-green-600 dark:text-green-400">
              <i :class="stop.type === 'station' ? 'fas fa-building' : 'fas fa-bus'" class="text-lg md:text-base"></i>
            </div>
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-sm md:text-xs font-semibold text-gray-900 dark:text-gray-100">{{ stop.name }}</span>
              <span class="flex gap-2 text-xs md:text-xs text-gray-500 dark:text-gray-400">
                <span v-if="stop.code" class="bg-gray-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{{ stop.code }}</span>
                <span v-if="stop.area" class="text-gray-600 dark:text-gray-300">{{ stop.area }}</span>
              </span>
            </div>
            <span class="px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap capitalize" :class="stop.type === 'station' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'">
              {{ stop.type === 'station' ? t('station') : t('roadside') }}
            </span>
          </li>
        </ul>

        <!-- Empty state when no search results -->
        <div v-else-if="searchQuery" class="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
          <i class="fas fa-search text-4xl mb-3 opacity-50"></i>
          <p class="text-sm m-0">{{ t('noResults') }}</p>
          <p class="text-xs mt-1 text-gray-400 dark:text-gray-500">Try searching with a different query</p>
        </div>

        <!-- Start typing hint -->
        <div v-else class="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
          <i class="fas fa-map-marker-alt text-4xl mb-3 opacity-50"></i>
          <p class="text-sm m-0">{{ t('searchDestination') }}</p>
          <p class="text-xs mt-1 text-gray-400 dark:text-gray-500">Type to find your destination</p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col items-center justify-center p-12 gap-4">
        <div class="w-10 h-10 border-3 border-gray-200 dark:border-neutral-600 border-t-green-600 rounded-full animate-spin"></div>
        <p class="text-sm text-gray-600 dark:text-gray-300">{{ t('findingNearestStop') || 'Finding nearest stop to you...' }}</p>
      </div>

      <!-- Error state -->
      <div v-if="error && !loading" class="flex flex-col items-center justify-center p-8 gap-3 bg-red-50 dark:bg-red-900/20 rounded-xl mt-4">
        <i class="fas fa-exclamation-circle text-2xl text-red-600 dark:text-red-400"></i>
        <p class="text-sm text-red-700 dark:text-red-300 m-0 text-center">{{ error }}</p>
        <button 
          v-if="selectedDestination" 
          @click="retryFindStop"
          class="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition-colors mt-2"
        >
          {{ t('tryAgain') || 'Try Again' }}
        </button>
      </div>

      <!-- Nearest stop card -->
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
/* Custom animations and any non-Tailwind specific styles */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

.border-3 {
  border-width: 3px;
}
</style>
