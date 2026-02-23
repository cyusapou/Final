<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen summary-screen">
      <div class="header">
        <button class="btn-back" @click="goToDestination">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ t.tripSummary }}</h2>
      </div>

      <!-- Trip Summary Card -->
      <div class="summary-card">
        <div class="summary-route">
          <div class="route-express">
            <div class="express-logo-sm">
              <i class="fas fa-bus"></i>
            </div>
            <span>{{ store.selectedExpress?.name }}</span>
          </div>
          <div class="route-time">
            {{ store.selectedTrip?.departure }} → {{ store.selectedTrip?.arrival }}
          </div>
        </div>

        <div class="summary-details">
          <div class="detail-row">
            <span class="label">
              <i class="fas fa-calendar"></i>
              {{ t.date }}
            </span>
            <span class="value">{{ formatDate(store.selectedDate) }}</span>
          </div>
<div class="detail-row">
            <span class="label">
              <i class="fas fa-map-marker-alt"></i>
              {{ t.origin }}
            </span>
            <span class="value">{{ store.selectedOriginStop?.name || 'Not selected' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">
              <i class="fas fa-map-marker-alt"></i>
              {{ t.destination }}
            </span>
            <span class="value">{{ store.selectedDestinationStop?.name || store.selectedDestination?.name || 'Not selected' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">
              <i class="fas fa-bus"></i>
              {{ t.bus }}
            </span>
            <span class="value">{{ store.selectedTrip?.plate }}</span>
          </div>
          <div class="detail-row">
            <span class="label">
              <i class="fas fa-phone"></i>
              {{ t.driver }}
            </span>
            <span class="value">{{ store.selectedTrip?.driverPhone }}</span>
          </div>
        </div>

        <div class="price-row">
          <span class="label">{{ t.totalPrice }}</span>
          <span class="price">RWF {{ store.selectedTrip?.price }}</span>
        </div>

        <button class="btn-primary btn-large btn-pay" @click="goToPayment">
          {{ t.proceedToPay }}
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn" @click="goToTrips">
          <i class="fas fa-exchange-alt"></i>
          {{ t.changeTrip }}
        </button>
        <button class="action-btn" @click="goToExpress">
          <i class="fas fa-bus"></i>
          {{ t.changeExpress }}
        </button>
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
import BottomNav from '../components/BottomNav.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const goToDestination = () => {
  router.push('/destination')
}

const goToTrips = () => {
  router.push('/trips')
}

const goToExpress = () => {
  router.push('/express')
}

const goToPayment = () => {
  router.push('/payment')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  })
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
@media (min-width: 1024px) {
  .page-wrapper {
    margin-left: 220px;
  }
  
  .mobile-lang-toggle {
    display: none;
  }
}

.screen {
  min-height: 100vh;
  padding: 20px;
  max-width: 600px;
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

.summary-card {
  background: #FFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E8E8E8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* Desktop: Larger card */
@media (min-width: 1024px) {
  .summary-card {
    padding: 32px;
  }
}

.summary-route {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #F5F5F5;
  margin-bottom: 20px;
}

.route-express {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.express-logo-sm {
  width: 36px;
  height: 36px;
  background: #E8F5E9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.express-logo-sm i {
  color: #2E7D32;
  font-size: 16px;
}

.route-express span {
  font-size: 15px;
  font-weight: 600;
  color: #212121;
}

.route-time {
  font-size: 22px;
  font-weight: 700;
  color: #2E7D32;
}

@media (min-width: 1024px) {
  .route-time {
    font-size: 26px;
  }
}

.summary-details {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #F5F5F5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-size: 14px;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row .label i {
  color: #2E7D32;
  font-size: 14px;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.price-row .label {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}

.price-row .price {
  font-size: 28px;
  font-weight: 700;
  color: #2E7D32;
}

@media (min-width: 1024px) {
  .price-row .price {
    font-size: 32px;
  }
}

.btn-primary {
  background: #2E7D32;
  color: #FFF;
  border: none;
  padding: 14px 36px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.btn-primary:hover {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-large {
  padding: 16px 40px;
  font-size: 17px;
}

.btn-pay {
  width: 100%;
  justify-content: center;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #E8E8E8;
  background: #FFF;
  font-size: 13px;
  font-weight: 500;
  color: #424242;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #2E7D32;
  color: #2E7D32;
}

.action-btn i {
  font-size: 14px;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
  
  .quick-actions {
    flex-direction: column;
  }
}

/* Bottom nav spacing on mobile */
@media (max-width: 1023px) {
  .page-wrapper {
    padding-bottom: 70px;
  }
}
</style>
