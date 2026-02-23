<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen express-screen">
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

      <!-- Express Cards -->
      <div v-if="filteredExpresses.length > 0" class="express-grid">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// Search state
const searchQuery = ref('')

// Data: Express Companies
const expressCompanies = ref([
  { id: 1, name: 'RITCO Ltd', description: 'Comfortable & punctual, government-partnered', logo: '' },
  { id: 2, name: 'Volcano Express', description: 'Popular for northern routes, frequent & reliable', logo: '' },
  { id: 3, name: 'Trinity Express', description: 'Cross-border to Uganda & Tanzania', logo: '' },
  { id: 4, name: 'Virunga Express', description: 'Reliable for north & intercity travel', logo: '' },
  { id: 5, name: 'Horizon Express', description: 'Good service & comfort', logo: '' },
  { id: 6, name: 'Stella Express', description: 'Modern with electric buses', logo: '' },
  { id: 7, name: 'Different Express', description: 'Regular intercity service', logo: '' },
  { id: 8, name: 'La Colombe Express', description: 'Northern & western routes', logo: '' },
  { id: 9, name: 'International Express', description: 'Regional lines', logo: '' },
  { id: 10, name: 'Ruhire Express', description: 'Eastern & southern routes', logo: '' },
  { id: 11, name: 'Select Express', description: 'International & regional', logo: '' },
  { id: 12, name: 'Yahoo Car Express', description: 'To Burundi borders', logo: '' },
  { id: 13, name: 'Capital Express', description: 'Kigali-Muhanga domestic', logo: '' },
  { id: 14, name: 'Kigali Bus Services', description: 'Urban & regional', logo: '' },
])

// Filtered express companies based on search
const filteredExpresses = computed(() => {
  if (!searchQuery.value) return expressCompanies.value
  
  const query = searchQuery.value.toLowerCase()
  return expressCompanies.value.filter(express => 
    express.name.toLowerCase().includes(query) || 
    express.description.toLowerCase().includes(query)
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
  router.push('/trips')
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
@media (min-width: 500px) {
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

.btn-back:hover {
  background: #E8F5E9;
  color: #2E7D32;
}

.screen-desc {
  font-size: 14px;
  color: #757575;
  margin-bottom: 20px;
}

/* Search Bar */
.search-bar {
  position: relative;
  margin-bottom: 24px;
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

.clear-search:hover {
  color: #212121;
}

.express-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
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

.express-card:hover {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
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

.express-info p {
  font-size: 12px;
  color: #757575;
  margin: 0;
  line-height: 1.4;
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

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E8E8E8;
}

.empty-state p {
  font-size: 15px;
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
