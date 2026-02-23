<template>
  <div class="page-wrapper">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen payment-screen">
      <div class="header">
        <button class="btn-back" @click="goToSummary" v-if="!store.showTicket">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ store.showTicket ? t.boomSet : t.selectPayment }}</h2>
      </div>

      <!-- Payment Options -->
      <div v-if="!store.showTicket" class="payment-options">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id"
          :class="['payment-card', { selected: selectedMethod?.id === method.id }]"
          @click="selectMethod(method)"
        >
          <div class="payment-icon">
            <i :class="method.icon"></i>
          </div>
          <div class="payment-info">
            <span class="payment-name">{{ method.name }}</span>
            <span class="payment-desc">{{ method.description }}</span>
          </div>
          <div v-if="selectedMethod?.id === method.id" class="selected-check">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>

        <!-- Pay Button -->
        <button 
          class="btn-primary btn-large btn-pay" 
          @click="processPayment"
          :disabled="!selectedMethod"
        >
          {{ t.payNow }} RWF {{ store.selectedTrip?.price }}
          <i class="fas fa-lock"></i>
        </button>

        <!-- Security Note -->
        <p class="security-note">
          <i class="fas fa-shield-alt"></i>
          {{ t.securePayment }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="store.isProcessing" class="loading">
        <div class="spinner"></div>
        <p>{{ t.processing }}</p>
        <p class="processing-detail">{{ t.dontClose }}</p>
      </div>

      <!-- Ticket -->
      <div v-if="store.showTicket" class="ticket-view">
        <div class="success-box">
          <div class="checkmark">
            <i class="fas fa-check"></i>
          </div>
          <h2>{{ t.boomSet }}</h2>
          <p>{{ t.paymentSuccess }}</p>
        </div>

        <div class="ticket-card">
          <div class="qr-box">
            <i class="fas fa-qrcode"></i>
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">{{ t.express }}</span>
              <span class="value">{{ store.selectedExpress?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.route }}</span>
              <span class="value">Kigali → {{ store.selectedDestination?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.departureTime }}</span>
              <span class="value">{{ store.selectedTrip?.departure }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.date }}</span>
              <span class="value">{{ formatDate(store.selectedDate) }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.bus }}</span>
              <span class="value">{{ store.selectedTrip?.plate }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ t.pricePaid }}</span>
              <span class="value text-green">RWF {{ store.selectedTrip?.price }}</span>
            </div>
          </div>

          <div class="stop-code-box">
            <span class="code-label">{{ t.busStopCode }}</span>
            <span class="code-value">{{ store.stopCode }}</span>
            <p class="code-note">{{ t.busStopCodeNote }}</p>
          </div>
        </div>

        <div class="ticket-buttons">
          <button class="btn-primary btn-full" @click="downloadTicket">
            <i class="fas fa-download"></i>
            {{ t.downloadTicket }}
          </button>
          <button class="btn-outline btn-full" @click="shareTicket">
            <i class="fas fa-share-alt"></i>
            {{ t.shareTicket }}
          </button>
        </div>

        <button class="btn-secondary btn-full" @click="goToLanding">
          {{ t.newBooking }}
        </button>
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

const selectedMethod = ref(null)

const paymentMethods = [
  { 
    id: 1, 
    name: 'Mobile Money', 
    icon: 'fas fa-mobile-alt',
    description: 'Pay with MTN or Airtel Money'
  },
  { 
    id: 2, 
    name: 'Debit Card', 
    icon: 'fas fa-credit-card',
    description: 'Visa, Mastercard, or Verve'
  },
  { 
    id: 3, 
    name: 'On The Go Wallet', 
    icon: 'fas fa-wallet',
    description: 'Use your app wallet balance'
  },
]

const goToSummary = () => {
  router.push('/summary')
}

const goToLanding = () => {
  store.reset()
  router.push('/')
}

const selectMethod = (method) => {
  selectedMethod.value = method
}

const processPayment = () => {
  if (!selectedMethod.value) return
  
  store.isProcessing = true
  setTimeout(() => {
    store.isProcessing = false
    store.showTicket = true
    store.stopCode = Math.floor(1000 + Math.random() * 9000).toString()
  }, 3000)
}

const downloadTicket = () => {
  alert('Download ticket - connect to backend')
}

const shareTicket = () => {
  alert('Share ticket - connect to backend')
}

const trackBus = () => {
  alert('Track bus - connect to backend')
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
  margin-bottom: 24px;
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

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #FFF;
  border-radius: 12px;
  border: 2px solid #E8E8E8;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-card:hover {
  border-color: #BDBDBD;
}

.payment-card.selected {
  border-color: #2E7D32;
  background: #F1F8E9;
}

.payment-icon {
  width: 48px;
  height: 48px;
  background: #E8F5E9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.payment-icon i {
  color: #2E7D32;
  font-size: 20px;
}

.payment-info {
  flex: 1;
}

.payment-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 2px;
}

.payment-desc {
  font-size: 12px;
  color: #757575;
}

.selected-check {
  color: #2E7D32;
  font-size: 20px;
}

.btn-primary {
  background: #2E7D32;
  color: #FFF;
  border: none;
  padding: 16px 36px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
  margin-top: 24px;
}

.btn-primary:hover:not(:disabled) {
  background: #1B5E20;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-primary:disabled {
  background: #BDBDBD;
  cursor: not-allowed;
}

.btn-large {
  padding: 18px 40px;
  font-size: 17px;
}

.btn-pay {
  width: 100%;
  justify-content: center;
}

.security-note {
  text-align: center;
  font-size: 12px;
  color: #757575;
  margin-top: 16px;
}

.security-note i {
  color: #2E7D32;
  margin-right: 6px;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E8E8E8;
  border-top-color: #2E7D32;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
}

.processing-detail {
  font-size: 13px !important;
  font-weight: 400 !important;
  color: #757575 !important;
}

/* Ticket View */
.ticket-view {
  max-width: 400px;
  margin: 0 auto;
}

.success-box {
  text-align: center;
  margin-bottom: 24px;
}

.checkmark {
  width: 72px;
  height: 72px;
  background: #2E7D32;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.checkmark i {
  color: #FFF;
  font-size: 32px;
}

.success-box h2 {
  font-size: 26px;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 4px;
}

.success-box p {
  font-size: 14px;
  color: #757575;
}

.ticket-card {
  background: #FFF;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E8E8E8;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.qr-box {
  width: 120px;
  height: 120px;
  background: #F5F5F5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.qr-box i {
  font-size: 60px;
  color: #212121;
}

.ticket-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F5F5F5;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 13px;
  color: #757575;
}

.info-row .value {
  font-size: 13px;
  font-weight: 600;
  color: #212121;
}

.text-green {
  color: #2E7D32;
  font-weight: 700 !important;
}

.stop-code-box {
  background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.code-label {
  display: block;
  font-size: 12px;
  color: #757575;
  margin-bottom: 8px;
}

.code-value {
  display: block;
  font-size: 36px;
  font-weight: 700;
  color: #2E7D32;
  letter-spacing: 4px;
  margin-bottom: 8px;
}

.code-note {
  font-size: 12px;
  color: #757575;
  margin: 0;
  line-height: 1.4;
}

.ticket-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-outline {
  background: transparent;
  border: 2px solid #2E7D32;
  color: #2E7D32;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #E8F5E9;
}

.btn-secondary {
  background: #1976D2;
  color: #FFF;
  border: none;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #1565C0;
}

.btn-full {
  width: 100%;
  justify-content: center;
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

/* Bottom nav spacing on mobile */
@media (max-width: 1023px) {
  .page-wrapper {
    padding-bottom: 70px;
  }
}
</style>
