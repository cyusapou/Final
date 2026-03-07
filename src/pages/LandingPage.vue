<template>
  <div class="landing-page">
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <div class="hero-wrapper">
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

        <div class="hero-actions">
          <button class="btn-primary" @click="goToExpress">
            {{ t.boardNow }}
            <i class="fas fa-arrow-right"></i>
          </button>
          <button class="btn-secondary" @click="goToPlanner">
            {{ t.planTrip }}
            <i class="fas fa-calendar-alt"></i>
          </button>
        </div>

        <p class="hint">{{ t.selectDateHint }}</p>

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

const goToExpress = () => router.push('/express')
const goToPlanner = () => router.push('/planner')
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: transparent;
}

.mobile-lang-toggle {
  display: block;
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 100;
}

@media (min-width: 500px) {
  .mobile-lang-toggle { display: none; }
}

.hero-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: var(--gradient-hero);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  max-width: 480px;
  width: 100%;
}

@media (min-width: 1024px) {
  .hero-section { max-width: 640px; }
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
  background: var(--primary-green);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon i { color: #FFF; font-size: 24px; }

@media (min-width: 1024px) {
  .logo-icon { width: 64px; height: 64px; border-radius: 16px; }
  .logo-icon i { font-size: 28px; }
}

.logo-text { text-align: left; }

.logo-text h1 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.logo-text span {
  font-size: 13px;
  color: var(--text-tertiary);
}

@media (min-width: 1024px) {
  .logo-text h1 { font-size: 32px; }
  .logo-text span { font-size: 15px; }
}

.headline {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

@media (min-width: 1024px) {
  .headline { font-size: 48px; margin-bottom: 16px; }
}

@media (max-width: 500px) {
  .headline { font-size: 26px; }
}

.subheadline {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

@media (min-width: 1024px) {
  .subheadline { font-size: 20px; margin-bottom: 36px; }
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

@media (min-width: 500px) {
  .hero-actions { flex-direction: row; justify-content: center; }
}

.btn-primary,
.btn-secondary {
  padding: 14px 36px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.25s;
  border: 2px solid transparent;
  width: 100%;
  justify-content: center;
}

@media (min-width: 500px) {
  .btn-primary, .btn-secondary { width: auto; }
}

@media (min-width: 1024px) {
  .btn-primary, .btn-secondary { padding: 18px 44px; font-size: 17px; }
}

.btn-primary {
  background: var(--primary-green);
  color: #FFF;
  border-color: var(--primary-green);
}

.btn-primary:hover {
  background: var(--primary-green-dark);
  border-color: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46, 125, 50, 0.35);
}

.btn-secondary {
  background: var(--card-bg);
  color: var(--primary-green);
  border-color: var(--primary-green);
}

.btn-secondary:hover {
  background: var(--primary-green-bg);
}

html.dark .btn-secondary:hover {
  background: rgba(46, 125, 50, 0.15);
}

.hint {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 16px;
}

.features-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-tertiary);
}

.feature-item i {
  font-size: 24px;
  color: var(--primary-green);
}

html.dark .feature-item i { color: var(--green); }

.feature-item span {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 500px) {
  .features-grid { gap: 20px; margin-top: 28px; }
  .feature-item i { font-size: 20px; }
  .feature-item span { font-size: 11px; }
}
</style>
