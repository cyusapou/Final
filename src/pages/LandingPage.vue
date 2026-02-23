<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle in fixed position -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>
    
    <div class="screen landing-screen">
      <div class="hero-section">
        <div class="logo-wrap">
          <div class="logo-icon">
            <i class="fas fa-bus"></i>
          </div>
          <div class="logo-text">
            <h1>On The Go</h1>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
        
        <h2 class="headline">{{ t.heroTitle }}</h2>
        <p class="subheadline">{{ t.heroSubtitle }}</p>
        
        <button class="btn-primary btn-large" @click="goToExpress">
          {{ t.boardNow }}
          <i class="fas fa-arrow-right"></i>
        </button>
        
        <button class="btn-secondary btn-large" @click="goToPlanner">
          {{ t.planTrip }}
          <i class="fas fa-calendar-alt"></i>
        </button>
        
        <p class="hint">{{ t.selectDateHint }}</p>
        
        <!-- Desktop: Feature highlights -->
        <div class="features-grid">
          <div class="feature-item">
            <i class="fas fa-clock"></i>
            <span>Fixed Schedules</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-mobile-alt"></i>
            <span>Cashless</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-leaf"></i>
            <span>Sustainable</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const goToExpress = () => {
  router.push('/express')
}

const goToPlanner = () => {
  router.push('/planner')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.page-wrapper {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  /* Let the landing gradient own the background instead of a flat gray */
  background: transparent;
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
}

.landing-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #E8F5E9 0%, #FFF 60%);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 480px;
}

/* Desktop: Larger hero */
@media (min-width: 1024px) {
  .hero-section {
    max-width: 640px;
  }
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
  justify-content: center;
}

.logo-icon {
  width: 52px;
  height: 52px;
  background: #2E7D32;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i {
  color: #FFF;
  font-size: 24px;
}

/* Desktop: Larger logo */
@media (min-width: 1024px) {
  .logo-icon {
    width: 64px;
    height: 64px;
    border-radius: 16px;
  }
  
  .logo-icon i {
    font-size: 28px;
  }
}

.logo-text {
  text-align: left;
}

.logo-text h1 {
  font-size: 26px;
  font-weight: 700;
  color: #212121;
  line-height: 1.2;
}

.logo-text span {
  font-size: 13px;
  color: #757575;
}

/* Desktop: Larger text */
@media (min-width: 1024px) {
  .logo-text h1 {
    font-size: 32px;
  }
  
  .logo-text span {
    font-size: 15px;
  }
}

.headline {
  font-size: 32px;
  font-weight: 700;
  color: #212121;
  margin-bottom: 8px;
}

/* Desktop: Larger headline */
@media (min-width: 1024px) {
  .headline {
    font-size: 48px;
    margin-bottom: 16px;
  }
}

.subheadline {
  font-size: 16px;
  color: #424242;
  margin-bottom: 28px;
}

/* Desktop: Larger subheadline */
@media (min-width: 1024px) {
  .subheadline {
    font-size: 20px;
    margin-bottom: 36px;
  }
}

.hint {
  font-size: 13px;
  color: #757575;
  margin-top: 16px;
}

.btn-primary {
  background: #2E7D32;
  color: #FFF;
  border: none;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.btn-primary:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-secondary {
  background: #FFF;
  color: #2E7D32;
  border: 2px solid #2E7D32;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.btn-secondary:hover {
  background: #E8F5E9;
}

.btn-large {
  padding: 16px 40px;
  font-size: 17px;
}

/* Desktop: Larger button */
@media (min-width: 1024px) {
  .btn-large {
    padding: 20px 48px;
    font-size: 18px;
    border-radius: 12px;
  }
}

/* Feature highlights */
.features-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #757575;
}

.feature-item i {
  font-size: 24px;
  color: #2E7D32;
}

.feature-item span {
  font-size: 13px;
  font-weight: 500;
}

/* Hide features on mobile */
@media (max-width: 600px) {
  .features-grid {
    display: none;
  }
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .headline {
    font-size: 26px;
  }
  
  .btn-large {
    padding: 14px 32px;
    font-size: 16px;
  }
  
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
}
</style>
