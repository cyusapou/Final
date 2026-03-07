<template>
  <div class="booking-detail">
    <div class="detail-header">
      <button class="btn-back" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h2>Booking Details</h2>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading booking...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadBooking">Retry</button>
    </div>

    <template v-else-if="booking">
      <div class="ticket-card">
        <div class="ticket-status" :class="booking.status">
          <i :class="statusIcon"></i>
          {{ booking.status }}
        </div>

        <div class="qr-section">
          <div ref="qrContainer" class="qr-box"></div>
          <p v-if="isExpired" class="expired-label">
            <i class="fas fa-clock"></i> Ticket Expired
          </p>
          <p v-else-if="booking.qrScanned" class="scanned-label">
            <i class="fas fa-check-circle"></i> Already Scanned
          </p>
        </div>

        <div class="detail-rows">
          <div class="detail-row">
            <span class="label"><i class="fas fa-road"></i> Route</span>
            <span class="value">{{ route?.origin }} → {{ route?.destination }}</span>
          </div>
          <div class="detail-row">
            <span class="label"><i class="fas fa-calendar-alt"></i> Date</span>
            <span class="value">{{ booking.date }}</span>
          </div>
          <div class="detail-row">
            <span class="label"><i class="fas fa-clock"></i> Departure</span>
            <span class="value time">{{ schedule?.departureTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label"><i class="fas fa-chair"></i> Seat</span>
            <span class="value">{{ booking.seatNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label"><i class="fas fa-bus"></i> Bus</span>
            <span class="value">{{ bus?.plateNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label"><i class="fas fa-building"></i> Company</span>
            <span class="value">{{ company?.name }}</span>
          </div>
          <div class="detail-row total">
            <span class="label">Total</span>
            <span class="value price">{{ booking.priceRWF?.toLocaleString() }} RWF</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-download" @click="handleDownload">
          <i class="fas fa-download"></i> Download Ticket
        </button>
        <button v-if="canShare" class="btn-share" @click="handleShare">
          <i class="fas fa-share-alt"></i> Share Ticket
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { bookingService } from '../services/bookingService.js'
import { scheduleService } from '../services/scheduleService.js'
import { routeService } from '../services/routeService.js'
import { busService } from '../services/busService.js'
import { companyService } from '../services/companyService.js'
import { useQRCode } from '../composables/useQRCode.js'

const routeInfo = useRoute()
const { generateQRCode, downloadQRCode } = useQRCode()

const booking = ref(null)
const schedule = ref(null)
const route = ref(null)
const bus = ref(null)
const company = ref(null)
const isLoading = ref(true)
const error = ref('')
const qrContainer = ref(null)
let qrCodeInstance = null

const canShare = computed(() => !!navigator.share)
const isExpired = computed(() => {
  if (!booking.value) return false
  const now = new Date()
  const bookingDate = new Date(booking.value.date + 'T23:59:59')
  return now > bookingDate
})
const statusIcon = computed(() => {
  const map = { confirmed: 'fas fa-check-circle', completed: 'fas fa-flag-checkered', cancelled: 'fas fa-times-circle' }
  return map[booking.value?.status] || 'fas fa-ticket-alt'
})

async function loadBooking() {
  isLoading.value = true
  error.value = ''
  try {
    const id = routeInfo.params.id
    booking.value = await bookingService.getById(id)
    const [s, r, b, c] = await Promise.all([
      scheduleService.getDetailed(booking.value.scheduleId),
      routeService.getById(booking.value.routeId),
      busService.getById(booking.value.busId),
      companyService.getById(booking.value.companyId),
    ])
    schedule.value = s
    route.value = r
    bus.value = b
    company.value = c
    await nextTick()
    renderQR()
  } catch (e) {
    error.value = 'Failed to load booking details'
  } finally {
    isLoading.value = false
  }
}

function renderQR() {
  if (!qrContainer.value || !booking.value?.qrData) return
  qrContainer.value.innerHTML = ''
  qrCodeInstance = generateQRCode(booking.value.qrData, qrContainer.value)
}

function handleDownload() {
  if (qrCodeInstance) {
    downloadQRCode(qrCodeInstance, `ticket-${booking.value.id}`)
  }
}

async function handleShare() {
  if (!navigator.share) return
  try {
    await navigator.share({
      title: 'On The Go - Bus Ticket',
      text: `Ticket: ${route.value?.origin} → ${route.value?.destination} | ${booking.value.date} at ${schedule.value?.departureTime} | Seat ${booking.value.seatNumber}`,
    })
  } catch { /* user cancelled */ }
}

onMounted(loadBooking)
</script>

<style scoped>
.booking-detail {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.detail-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--card-bg, #141414);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}
.loading-state i, .error-state i {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}
.error-state i { color: #ef4444; }
.btn-retry {
  margin-top: 16px;
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  background: #22c55e;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.ticket-card {
  background: var(--card-bg, #141414);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color, rgba(255,255,255,0.07));
}
.ticket-status {
  padding: 12px 20px;
  text-align: center;
  font-weight: 600;
  text-transform: capitalize;
  font-size: 14px;
  letter-spacing: 0.5px;
}
.ticket-status.confirmed {
  background: rgba(34,197,94,0.12);
  color: #22c55e;
}
.ticket-status.completed {
  background: rgba(59,130,246,0.12);
  color: #3b82f6;
}
.ticket-status.cancelled {
  background: rgba(239,68,68,0.12);
  color: #ef4444;
}
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}
.qr-box {
  width: 280px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
}
.expired-label, .scanned-label {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
}
.expired-label { color: #ef4444; }
.scanned-label { color: #22c55e; }
.detail-rows {
  padding: 0 20px 20px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.07));
}
.detail-row:last-child { border-bottom: none; }
.detail-row .label {
  color: var(--text-secondary, rgba(255,255,255,0.4));
  font-size: 14px;
}
.detail-row .label i {
  width: 20px;
  text-align: center;
  margin-right: 8px;
}
.detail-row .value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  text-align: right;
}
.detail-row .value.time { color: #22c55e; font-size: 16px; }
.detail-row .value.price { color: #22c55e; font-size: 18px; }
.detail-row.total { padding-top: 16px; }
.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.btn-download, .btn-share {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
}
.btn-download {
  background: #22c55e;
  color: #fff;
}
.btn-download:hover { background: #16a34a; }
.btn-share {
  background: var(--card-bg, #141414);
  color: var(--text-primary);
  border: 1px solid var(--border-color, rgba(255,255,255,0.07));
}
.btn-share:hover { background: rgba(255,255,255,0.05); }

html.dark .booking-detail { background: #0a0a0a; }
</style>
