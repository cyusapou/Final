<template>
  <div class="track-page">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <!-- Page Header -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>{{ t.track }}</h1>
      <div class="spacer"></div>
    </div>

    <!-- New Interactive Bus Map -->
    <div class="map-section">
      <BusMapFeature ref="busMapRef" />
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import BusMapFeature from '../components/BusMapFeature.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// Component refs
const busMapRef = ref(null)

const goBack = () => {
  router.back()
}

// Expose methods for external access if needed
defineExpose({
  busMapRef,
  findNearestStation: () => busMapRef.value?.handleFindNearestStation(),
  centerOnUser: () => busMapRef.value?.centerOnUser(),
  resetView: () => busMapRef.value?.resetView()
})
</script>


<style scoped>
.track-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F5E9 0%, var(--bg-primary) 60%);
  padding-bottom: 20px;
}

/* Mobile: Language toggle */
.mobile-lang-toggle {
  display: none;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

@media (max-width: 499px) {
  .mobile-lang-toggle {
    display: block;
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
    padding: 0;
    border: none;
  }
}

/* Header */
.page-header {
  background: var(--bg-secondary);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}

.back-btn:active {
  transform: scale(0.95);
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  text-align: center;
}

.spacer {
  width: 40px;
}

/* Map Section */
.map-section {
  margin: 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: var(--bg-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-section {
    margin: 12px;
  }
  
  .page-header h1 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .map-section {
    margin: 8px;
  }
  
  .page-header {
    padding: 12px;
  }
  
  .back-btn {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .spacer {
    width: 36px;
  }
}

/* Desktop: max width constraint */
@media (min-width: 500px) {
  .track-page {
    max-width: 900px;
    margin: 0 auto;
  }
  
  .mobile-lang-toggle {
    display: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .track-page {
    background: linear-gradient(180deg, #1B5E20 0%, var(--bg-primary) 60%);
  }
}
</style>
