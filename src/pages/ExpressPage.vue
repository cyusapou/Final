<template>
  <div class="page-wrapper bg-white dark:bg-neutral-950 transition-colors">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen express-screen bg-white dark:bg-neutral-950">
      <div class="header">
        <button class="btn-back" @click="goToLanding">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.selectExpress }}</h2>
      </div>

      <p class="screen-desc">{{ t.chooseExpress }}</p>

      <!-- Search Bar -->
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          :placeholder="t.searchPlaceholder"
          class="search-input"
        >
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="empty-state">
        <div class="spinner"></div>
        <p>Loading companies...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="empty-state error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="fetchCompanies">
          <i class="fas fa-redo"></i> Retry
        </button>
      </div>

      <!-- Express Cards -->
      <div v-else-if="filteredExpresses.length > 0" class="express-grid">
        <div 
          v-for="express in filteredExpresses" 
          :key="express.id"
          class="express-card"
          @click="selectExpress(express)"
        >
          <div class="express-logo">
            <img v-if="express.logo" :src="express.logo" :alt="express.name">
            <i v-else class="fas fa-bus"></i>
          </div>
          <div class="express-info">
            <h3>{{ express.name }}</h3>
            <p>{{ express.description }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="fas fa-search"></i>
        <p>{{ t.noResults }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import { companyService } from '../services/companyService.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const searchQuery = ref('')
const expressCompanies = ref([])
const isLoading = ref(false)
const error = ref(null)

const fetchCompanies = async () => {
  isLoading.value = true
  error.value = null
  try {
    expressCompanies.value = await companyService.getActive()
  } catch (e) {
    error.value = 'Failed to load companies. Please try again.'
    console.error('Error fetching companies:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchCompanies)

const filteredExpresses = computed(() => {
  if (!searchQuery.value) return expressCompanies.value
  
  const query = searchQuery.value.toLowerCase()
  return expressCompanies.value.filter(express => 
    express.name.toLowerCase().includes(query) || 
    (express.description && express.description.toLowerCase().includes(query))
  )
})

const clearSearch = () => {
  searchQuery.value = ''
}

const goToLanding = () => {
  router.push('/')
}

const selectExpress = (express) => {
  store.selectedExpress = express
  router.push('/destination')
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

html.dark .page-wrapper {
  background: var(--bg-primary);
}

.mobile-lang-toggle {
  display: block;
}

/* Desktop sidebar spacing */
@media (min-width: 500px) {
  .mobile-lang-toggle {
    display: none;
  }
}

.screen {
  min-height: 100vh;
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
  padding-bottom: 20px;
}

/* Desktop: Add padding */
@media (min-width: 500px) {
  .screen {
    padding: 24px;
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

html.dark .header h2 {
  color: var(--text-primary);
}

/* Desktop: Larger header */
@media (min-width: 500px) {
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

html.dark .btn-back {
  background: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

html.dark .btn-back:hover {
  background: var(--green-muted);
  color: var(--green);
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

html.dark .screen-desc {
  color: var(--text-secondary);
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

html.dark .search-bar i {
  color: var(--text-secondary);
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

html.dark .search-input {
  background: var(--input-bg);
  border-color: var(--input-border);
  color: var(--text-primary);
}

html.dark .search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

html.dark .search-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15);
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

html.dark .clear-search {
  color: var(--text-secondary);
}

.clear-search:hover {
  color: #212121;
}

html.dark .clear-search:hover {
  color: var(--text-primary);
}

.express-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 0;
}

@media (min-width: 768px) {
  .express-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (min-width: 1024px) {
  .express-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

.express-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #FFF;
  border-radius: 12px;
  border: 1.5px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

html.dark .express-card {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.express-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

html.dark .express-card:hover {
  border-left: 3px solid var(--green);
  background: var(--hover);
  box-shadow: var(--glow);
}

.express-card:active {
  transform: translateY(0);
}

.express-logo {
  width: 50px;
  height: 50px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

html.dark .express-logo {
  background: var(--green-muted);
}

html.dark .express-logo i {
  color: var(--green);
}

.express-logo img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.express-logo i {
  color: #2E7D32;
  font-size: 20px;
}

.express-info h3 {
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 2px;
}

html.dark .express-info h3 {
  color: var(--text-primary);
}

.express-info p {
  font-size: 12px;
  color: #757575;
  margin: 0;
  line-height: 1.4;
}

html.dark .express-info p {
  color: var(--text-secondary);
}

/* Desktop: Larger cards */
@media (min-width: 500px) {
  .express-card {
    padding: 20px;
  }
  
  .express-info h3 {
    font-size: 16px;
  }
  
  .express-info p {
    font-size: 13px;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #757575;
}

html.dark .empty-state {
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E8E8E8;
}

html.dark .empty-state i {
  color: var(--green);
}

.empty-state p {
  font-size: 15px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E8E8E8;
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

html.dark .spinner {
  border-color: var(--border-color);
  border-top-color: var(--green);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state i {
  color: #D32F2F !important;
}

.btn-retry {
  margin-top: 12px;
  padding: 8px 20px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

html.dark .btn-retry {
  background: var(--green);
}

.btn-retry:hover {
  background: #1B5E20;
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
}
</style>
