<template>
  <div class="page-wrapper bg-white dark:bg-neutral-900 transition-colors">
    <!-- Mobile: Language toggle -->
    <div class="mobile-lang-toggle">
      <LanguageToggle />
    </div>

    <StepProgress />
    
    <div class="screen payment-screen bg-white dark:bg-neutral-900">
      <div class="header">
        <button class="btn-back" @click="goToSummary" v-if="!store.showTicket">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h2>{{ store.showTicket ? t.boomSet : t.selectPayment }}</h2>
      </div>

      <!-- Payment Options -->
      <div v-if="!store.showTicket && !store.isProcessing" class="payment-options">
        <div class="payment-methods-grid">
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
        </div>

        <!-- Payment Form - Mobile Money -->
        <div v-if="selectedMethod?.id === 1" class="payment-form">
          <h3>{{ t.enterMobileNumber || 'Enter Mobile Money Details' }}</h3>
          <div class="form-group">
            <label>{{ t.phoneNumber || 'Phone Number' }}</label>
            <input 
              v-model="mobileMoneyForm.phone"
              type="tel" 
              placeholder="+250788123456"
              class="form-input"
              :class="{ 'input-error': momoErrors.phone }"
              @blur="validateMomoPhone"
            />
            <span v-if="momoErrors.phone" class="field-error">{{ momoErrors.phone }}</span>
          </div>
          <div class="form-group">
            <label>{{ t.momoPassword || 'MoMo Password' }}</label>
            <input 
              v-model="mobileMoneyForm.password"
              type="password" 
              :placeholder="t.enterPassword || 'Enter your MoMo PIN'"
              class="form-input"
              :class="{ 'input-error': momoErrors.password }"
              @blur="validateMomoPassword"
            />
            <span v-if="momoErrors.password" class="field-error">{{ momoErrors.password }}</span>
          </div>
        </div>

        <!-- Payment Form - Credit Card -->
        <div v-if="selectedMethod?.id === 2" class="payment-form">
          <h3>{{ t.enterCardDetails || 'Enter Card Details' }}</h3>
          <div class="form-group">
            <label>{{ t.cardholderName || 'Cardholder Name' }}</label>
            <input 
              v-model="creditCardForm.cardholderName"
              type="text" 
              :placeholder="t.fullName || 'Your full name'"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>{{ t.cardNumber || 'Card Number' }}</label>
            <input 
              v-model="creditCardForm.cardNumber"
              type="text" 
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              class="form-input"
              @input="formatCardNumber"
            />
          </div>
          <div class="form-row-inline">
            <div class="form-group">
              <label>{{ t.expiryDate || 'Expiry Date' }}</label>
              <input 
                v-model="creditCardForm.expiryDate"
                type="text" 
                placeholder="MM/YY"
                maxlength="5"
                class="form-input"
                @input="formatExpiryDate"
              />
            </div>
            <div class="form-group">
              <label>{{ t.cvv || 'CVV' }}</label>
              <input 
                v-model="creditCardForm.cvv"
                type="text" 
                placeholder="123"
                maxlength="4"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Payment Form - On The Go Wallet -->
        <div v-if="selectedMethod?.id === 3" class="payment-form">
          <div v-if="!isAuthenticated" class="auth-warning">
            <div class="warning-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="warning-content">
              <h4>{{ t.loginRequired || 'Login Required' }}</h4>
              <p>{{ t.createAccountForWallet || 'Please create an account or login to use the On The Go Wallet payment method.' }}</p>
              <button class="btn-warning-action" @click="goToLogin">
                {{ t.createAccount || 'Create Account' }}
              </button>
            </div>
          </div>
          <div v-else class="wallet-info">
            <div class="wallet-balance-display">
              <span class="label">{{ t.availableBalance || 'Available Balance' }}</span>
              <span class="amount">RWF {{ formatBalance(store.user?.walletBalance || 0) }}</span>
            </div>
            <p v-if="store.user?.walletBalance < store.selectedTrip?.price" class="insufficient-warning">
              <i class="fas fa-exclamation-triangle"></i>
              {{ t.insufficientWalletBalance || 'Your wallet balance is insufficient for this transaction.' }}
            </p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Route</span>
            <span>Kigali → {{ store.selectedDestination?.name || '—' }}</span>
          </div>
          <div class="summary-row">
            <span>Departure</span>
            <span>{{ store.selectedTrip?.departure || '—' }}</span>
          </div>
          <div class="summary-row total-row">
            <span>Total</span>
            <span class="total-amount">RWF {{ store.selectedTrip?.price || 0 }}</span>
          </div>
        </div>

        <!-- Pay Button -->
        <button 
          class="btn-pay" 
          @click="processPayment"
          :disabled="!isFormValid()"
        >
          <span class="btn-pay-text">
            {{ t.payNow }} RWF {{ store.selectedTrip?.price }}
          </span>
          <i class="fas fa-lock btn-pay-lock"></i>
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
          <button class="btn-primary-action btn-full" @click="downloadTicket">
            <i class="fas fa-download"></i>
            {{ t.downloadTicket }}
          </button>
          <button class="btn-outline btn-full" @click="shareTicket">
            <i class="fas fa-share-alt"></i>
            {{ t.shareTicket }}
          </button>
        </div>

        <button class="btn-new-booking btn-full" @click="goToLanding">
          {{ t.newBooking }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from '../components/LanguageToggle.vue'
import StepProgress from '../components/StepProgress.vue'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const isAuthenticated = computed(() => store.token && store.user)

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

const selectedMethod = ref(paymentMethods[0])

const mobileMoneyForm = ref({
  phone: '',
  password: ''
})

const creditCardForm = ref({
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

// Validation errors
const momoErrors = reactive({
  phone: '',
  password: ''
})

const validateMomoPhone = () => {
  const phone = mobileMoneyForm.value.phone.replace(/\s/g, '')
  if (!phone) {
    momoErrors.phone = 'Phone number is required'
  } else if (!/^(\+?250|0)?7\d{8}$/.test(phone)) {
    momoErrors.phone = 'Enter a valid Rwandan phone number'
  } else {
    momoErrors.phone = ''
  }
}

const validateMomoPassword = () => {
  if (!mobileMoneyForm.value.password.trim()) {
    momoErrors.password = 'MoMo PIN is required'
  } else if (mobileMoneyForm.value.password.length < 4) {
    momoErrors.password = 'PIN must be at least 4 digits'
  } else {
    momoErrors.password = ''
  }
}

// Card number formatting
const formatCardNumber = () => {
  let value = creditCardForm.value.cardNumber.replace(/\D/g, '')
  value = value.replace(/(.{4})/g, '$1 ').trim()
  creditCardForm.value.cardNumber = value.substring(0, 19)
}

// Expiry date formatting
const formatExpiryDate = () => {
  let value = creditCardForm.value.expiryDate.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2)
  }
  creditCardForm.value.expiryDate = value.substring(0, 5)
}

const isFormValid = () => {
  if (!selectedMethod.value) return false
  
  if (selectedMethod.value.id === 1) {
    const phone = mobileMoneyForm.value.phone.replace(/\s/g, '')
    return /^(\+?250|0)?7\d{8}$/.test(phone) && mobileMoneyForm.value.password.trim().length >= 4
  } else if (selectedMethod.value.id === 2) {
    return creditCardForm.value.cardholderName.trim() && 
           creditCardForm.value.cardNumber.replace(/\s/g, '').length >= 13 &&
           creditCardForm.value.expiryDate.trim().length === 5 &&
           creditCardForm.value.cvv.trim().length >= 3
  } else if (selectedMethod.value.id === 3) {
    return isAuthenticated.value && (store.user?.walletBalance || 0) >= (store.selectedTrip?.price || 0)
  }
  
  return false
}

const goToLogin = () => {
  router.push('/login')
}

const goToSummary = () => {
  router.push('/summary')
}

const goToLanding = () => {
  store.reset()
  router.push('/')
}

const selectMethod = (method) => {
  selectedMethod.value = method
  // Clear errors when switching methods
  momoErrors.phone = ''
  momoErrors.password = ''
}

const processPayment = () => {
  if (!isFormValid()) return
  
  store.isProcessing = true
  setTimeout(() => {
    store.isProcessing = false
    store.showTicket = true
    store.stopCode = Math.floor(1000 + Math.random() * 9000).toString()
  }, 3000)
}

const downloadTicket = () => {
  // Create a canvas to draw the ticket
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Set canvas size (ticket dimensions)
  canvas.width = 400
  canvas.height = 600
  
  // Background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Header background
  ctx.fillStyle = '#2E7D32'
  ctx.fillRect(0, 0, canvas.width, 100)
  
  // Header text
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 24px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('ON THE GO', canvas.width / 2, 40)
  ctx.font = '14px Inter, Arial, sans-serif'
  ctx.fillText('Bus Ticket', canvas.width / 2, 60)
  
  // Success checkmark
  ctx.fillStyle = '#4CAF50'
  ctx.beginPath()
  ctx.arc(canvas.width / 2, 130, 25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 20px Arial'
  ctx.fillText('✓', canvas.width / 2, 138)
  
  // Success message
  ctx.fillStyle = '#212121'
  ctx.font = 'bold 18px Inter, Arial, sans-serif'
  ctx.fillText('Payment Successful!', canvas.width / 2, 180)
  ctx.font = '14px Inter, Arial, sans-serif'
  ctx.fillStyle = '#757575'
  ctx.fillText('Your booking is confirmed', canvas.width / 2, 200)
  
  // Divider
  ctx.strokeStyle = '#E8E8E8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(20, 220)
  ctx.lineTo(canvas.width - 20, 220)
  ctx.stroke()
  
  // Ticket details
  const drawRow = (label, value, y) => {
    ctx.fillStyle = '#757575'
    ctx.font = '12px Inter, Arial, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(label, 30, y)
    ctx.fillStyle = '#212121'
    ctx.font = 'bold 14px Inter, Arial, sans-serif'
    ctx.fillText(value, 30, y + 18)
  }
  
  drawRow('EXPRESS', store.selectedExpress?.name || 'N/A', 240)
  drawRow('ROUTE', `Kigali → ${store.selectedDestination?.name || 'N/A'}`, 280)
  drawRow('DEPARTURE', store.selectedTrip?.departure || 'N/A', 320)
  drawRow('DATE', formatDate(store.selectedDate), 360)
  drawRow('BUS PLATE', store.selectedTrip?.plate || 'N/A', 400)
  
  // Price
  ctx.fillStyle = '#E8F5E9'
  ctx.fillRect(20, 440, canvas.width - 40, 50)
  ctx.fillStyle = '#2E7D32'
  ctx.font = 'bold 16px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('PRICE PAID', canvas.width / 2, 460)
  ctx.font = 'bold 24px Inter, Arial, sans-serif'
  ctx.fillText(`RWF ${store.selectedTrip?.price || '0'}`, canvas.width / 2, 480)
  
  // Stop code box
  ctx.strokeStyle = '#2E7D32'
  ctx.lineWidth = 2
  ctx.strokeRect(30, 500, canvas.width - 60, 60)
  ctx.fillStyle = '#757575'
  ctx.font = '10px Inter, Arial, sans-serif'
  ctx.fillText('BUS STOP CODE', canvas.width / 2, 520)
  ctx.fillStyle = '#2E7D32'
  ctx.font = 'bold 28px Inter, Arial, sans-serif'
  ctx.fillText(store.stopCode || '----', canvas.width / 2, 545)
  
  // Footer
  ctx.fillStyle = '#757575'
  ctx.font = '10px Inter, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Present this code at the bus stop', canvas.width / 2, 580)
  
  // Generate and download
  const link = document.createElement('a')
  link.download = `OnTheGo-Ticket-${store.stopCode}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const shareTicket = () => {
  if (navigator.share) {
    navigator.share({
      title: 'On The Go - Bus Ticket',
      text: `Bus ticket: Kigali → ${store.selectedDestination?.name}, Departure: ${store.selectedTrip?.departure}, Stop Code: ${store.stopCode}`,
    }).catch(() => {})
  } else {
    alert('Share ticket - connect to backend')
  }
}

const formatBalance = (amount) => {
  return new Intl.NumberFormat('en-US').format(Math.floor(amount))
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
  padding: 16px;
  max-width: 640px;
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
  font-weight: 700;
  color: #212121;
}

html.dark .header h2 {
  color: #FFFFFF;
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
  flex-shrink: 0;
}

html.dark .btn-back {
  background: #2C2C2C;
  border-color: #3A3A3A;
  color: #FFFFFF;
}

.btn-back:hover {
  background: #E8F5E9;
  color: #2E7D32;
}

html.dark .btn-back:hover {
  background: #1B5E20;
  color: #66BB6A;
}

/* ============================================
   PAYMENT METHODS GRID
   ============================================ */
.payment-methods-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
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
  -webkit-tap-highlight-color: transparent;
}

html.dark .payment-card {
  background: #1E1E1E;
  border-color: #2C2C2C;
}

.payment-card:hover {
  border-color: #BDBDBD;
  background: #FAFAFA;
}

html.dark .payment-card:hover {
  border-color: #3A3A3A;
  background: #262626;
}

.payment-card.selected {
  border-color: #2E7D32;
  background: #F1F8E9;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

html.dark .payment-card.selected {
  border-color: #66BB6A;
  background: #1B5E20;
  box-shadow: 0 0 0 3px rgba(102, 187, 106, 0.2);
}

.payment-icon {
  width: 44px;
  height: 44px;
  background: #E8F5E9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

html.dark .payment-icon {
  background: #1B5E20;
}

.payment-icon i {
  color: #2E7D32;
  font-size: 18px;
}

html.dark .payment-icon i {
  color: #66BB6A;
}

.payment-info {
  flex: 1;
  min-width: 0;
}

.payment-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 2px;
}

.payment-desc {
  display: block;
  font-size: 12px;
  color: #757575;
}

.selected-check {
  color: #2E7D32;
  font-size: 20px;
  flex-shrink: 0;
}

/* Tablet: 3-column grid for payment methods */
@media (min-width: 600px) {
  .payment-methods-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .payment-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px 14px;
    gap: 10px;
  }

  .payment-info {
    text-align: center;
  }

  .selected-check {
    position: absolute;
    top: 8px;
    right: 8px;
  }

  .payment-card {
    position: relative;
  }
}

/* ============================================
   PAYMENT FORM STYLES
   ============================================ */
.payment-form {
  background: #FFF;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #E8E8E8;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-form h3 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  color: #212121;
  background: #FFF;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-input::placeholder {
  color: #BDBDBD;
}

.form-input.input-error {
  border-color: #D32F2F;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.field-error {
  display: block;
  color: #D32F2F;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.form-row-inline {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* ============================================
   ORDER SUMMARY
   ============================================ */
.order-summary {
  background: #FFF;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 20px;
  border: 1px solid #E8E8E8;
}

.order-summary h3 {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #616161;
  border-bottom: 1px solid #F5F5F5;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total-row {
  padding-top: 12px;
  margin-top: 4px;
  border-top: 2px solid #E8E8E8;
  border-bottom: none;
  font-weight: 700;
  color: #212121;
}

.total-amount {
  color: #2E7D32;
  font-size: 16px;
  font-weight: 700;
}

/* ============================================
   AUTHENTICATION WARNING
   ============================================ */
.auth-warning {
  background: #FFF3E0;
  border: 1px solid #FFB74D;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.warning-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #FFF9C4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F57F17;
  font-size: 20px;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #E65100;
}

.warning-content p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #BF360C;
  line-height: 1.4;
}

.btn-warning-action {
  background: #FF6F00;
  color: #FFF;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-warning-action:hover {
  background: #E65100;
}

/* ============================================
   WALLET INFO
   ============================================ */
.wallet-info {
  background: #E8F5E9;
  border-radius: 12px;
  padding: 16px;
}

.wallet-balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.wallet-balance-display .label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.wallet-balance-display .amount {
  font-size: 20px;
  font-weight: 700;
  color: #2E7D32;
}

.insufficient-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFEBEE;
  border-radius: 8px;
  font-size: 13px;
  color: #C62828;
  margin: 0;
  line-height: 1.4;
}

.insufficient-warning i {
  flex-shrink: 0;
  color: #D32F2F;
}

/* ============================================
   PAY BUTTON
   ============================================ */
.btn-pay {
  width: 100%;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  color: #FFF;
  border: none;
  padding: 18px 36px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
  -webkit-tap-highlight-color: transparent;
}

.btn-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(46, 125, 50, 0.4);
}

.btn-pay:active:not(:disabled) {
  transform: translateY(0);
}

.btn-pay:disabled {
  background: #BDBDBD;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.btn-pay-text {
  flex: 1;
  text-align: center;
}

.btn-pay-lock {
  font-size: 14px;
  opacity: 0.8;
}

.security-note {
  text-align: center;
  font-size: 12px;
  color: #757575;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.security-note i {
  color: #2E7D32;
}

/* ============================================
   LOADING
   ============================================ */
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

/* ============================================
   TICKET VIEW
   ============================================ */
.ticket-view {
  max-width: 420px;
  margin: 0 auto;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-box {
  text-align: center;
  margin-bottom: 24px;
}

.checkmark {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(46, 125, 50, 0.3);
  animation: checkPop 0.5s ease 0.2s both;
}

@keyframes checkPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
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
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
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
  color: #2E7D32 !important;
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

/* ============================================
   TICKET BUTTONS
   ============================================ */
.ticket-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-primary-action {
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  color: #FFF;
  border: none;
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
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.btn-primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 125, 50, 0.3);
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

.btn-new-booking {
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

.btn-new-booking:hover {
  background: #1565C0;
  transform: translateY(-2px);
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* ============================================
   TABLET (>= 600px)
   ============================================ */
@media (min-width: 600px) {
  .ticket-buttons {
    flex-direction: row;
  }

  .ticket-buttons .btn-full {
    flex: 1;
  }
}

/* ============================================
   MOBILE ADJUSTMENTS
   ============================================ */
@media (max-width: 600px) {
  .mobile-lang-toggle {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 100;
  }
}

/* ============================================
   BOTTOM NAV SPACING ON MOBILE
   ============================================ */
@media (max-width: 1023px) {
  .page-wrapper {
    padding-bottom: 70px;
  }
}
</style>
