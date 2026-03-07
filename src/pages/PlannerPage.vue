<template>
  <div class="page-container bg-white dark:bg-neutral-950 transition-colors" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="page-header">
      <h1>{{ t.planFutureTrip }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="empty-state">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-banner">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{{ error }}</span>
      <button @click="loadData">Retry</button>
    </div>

    <!-- Create New Plan -->
    <div class="section">
      <div class="plan-form-card">
        <h2>{{ t.selectDate }}</h2>
        
        <div class="form-row">
          <div class="form-group">
            <label>{{ t.selectDate }}</label>
            <input 
              v-model="formData.date" 
              type="date" 
              class="form-input"
              :min="today"
            />
          </div>
          
          <div class="form-group">
            <label>{{ t.selectTime }}</label>
            <input 
              v-model="formData.time" 
              type="time" 
              class="form-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label>{{ t.whereBoarding }}</label>
          <select v-model="formData.originStopId" class="form-select">
            <option value="">{{ t.selectDestination }}</option>
            <option v-for="stop in stops" :key="stop.id" :value="stop.id">
              {{ stop.name }} ({{ stop.city }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>{{ t.whereGettingOff }}</label>
          <select v-model="formData.destinationStopId" class="form-select">
            <option value="">{{ t.selectDestination }}</option>
            <option v-for="stop in stops" :key="stop.id" :value="stop.id">
              {{ stop.name }} ({{ stop.city }})
            </option>
          </select>
        </div>

        <!-- Repetition Options -->
        <div class="form-group">
          <label>Trip Type</label>
          <div class="trip-type-selector">
            <button 
              :class="['type-btn', { active: formData.tripType === 'one-time' }]"
              @click="formData.tripType = 'one-time'"
            >
              <i class="fas fa-calendar"></i>
              {{ t.oneTimeTrip }}
            </button>
            <button 
              :class="['type-btn', { active: formData.tripType === 'repeating' }]"
              @click="formData.tripType = 'repeating'"
            >
              <i class="fas fa-redo"></i>
              {{ t.repeatingTrip }}
            </button>
          </div>
        </div>

        <!-- Repeating Options -->
        <div v-if="formData.tripType === 'repeating'" class="repeating-options">
          <div class="form-group">
            <label>Repeat</label>
            <div class="repeat-selector">
              <button 
                v-for="option in repeatOptions" 
                :key="option.value"
                :class="['repeat-btn', { active: formData.repeatPattern === option.value }]"
                @click="formData.repeatPattern = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reminder -->
        <div class="form-group">
          <div class="reminder-toggle">
            <label>
              <input type="checkbox" v-model="formData.reminderEnabled" />
              <span>{{ t.reminder }}</span>
            </label>
            <select v-if="formData.reminderEnabled" v-model="formData.reminderMinutes" class="reminder-select">
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
            <span v-if="formData.reminderEnabled" class="reminder-text">{{ t.minutesBefore }}</span>
          </div>
        </div>

        <button class="btn-save-plan" @click="savePlan">
          <i class="fas fa-calendar-plus"></i>
          {{ t.save }}
        </button>
      </div>
    </div>

    <!-- Upcoming Planned Trips -->
    <div class="section">
      <h2 class="section-title">{{ t.upcomingPlannedTrips }}</h2>
      
      <div v-if="upcomingTrips.length === 0" class="empty-state">
        <i class="fas fa-calendar-check"></i>
        <p>{{ t.noPlannedTrips }}</p>
        <p class="hint">{{ t.planAhead }}</p>
      </div>

      <div v-else class="planned-trips-list">
        <div v-for="trip in upcomingTrips" :key="trip.id" class="planned-trip-card">
          <div class="trip-date-box">
            <span class="day">{{ formatDay(trip.date) }}</span>
            <span class="month">{{ formatMonth(trip.date) }}</span>
          </div>
          
          <div class="trip-details">
            <div class="trip-time">
              <i class="fas fa-clock"></i>
              {{ trip.time }}
            </div>
            <div class="trip-route">
              {{ trip.originStop.name }} → {{ trip.destinationStop.name }}
            </div>
            <div class="trip-status" :class="trip.status">
              {{ getStatusLabel(trip.status) }}
            </div>
          </div>

          <div class="trip-actions">
            <button 
              v-if="trip.status === 'planned'" 
              class="btn-book-now"
              @click="bookPlannedTrip(trip)"
            >
              <i class="fas fa-ticket-alt"></i>
              {{ t.bookThisTrip }}
            </button>
            <button 
              class="btn-delete"
              @click="deletePlannedTrip(trip.id)"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import { stopService } from '../services/stopService.js'
import { plannedTripService } from '../services/plannedTripService.js'

const USER_ID = 'u001'
const router = useRouter()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)

const stops = ref([])
const upcomingTrips = ref([])
const isLoading = ref(false)
const error = ref(null)

const today = new Date().toISOString().split('T')[0]

const formData = ref({
  date: today,
  time: '08:00',
  originStopId: '',
  destinationStopId: '',
  tripType: 'one-time',
  repeatPattern: 'daily',
  reminderEnabled: false,
  reminderMinutes: 30,
})

const loadData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const [stopsData, tripsData] = await Promise.all([
      stopService.getAll(),
      plannedTripService.getUpcoming(USER_ID),
    ])
    stops.value = stopsData
    upcomingTrips.value = tripsData
  } catch (e) {
    error.value = 'Failed to load data. Please try again.'
    console.error('Error loading planner data:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)

const repeatOptions = computed(() => [
  { value: 'daily', label: t.value.daily },
  { value: 'weekdays', label: t.value.weekdays },
  { value: 'weekends', label: t.value.weekends },
])

const formatDay = (dateStr) => {
  return new Date(dateStr).getDate()
}

const formatMonth = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString(currentLang.value === 'en' ? 'en-US' : 'rw-RW', { month: 'short' })
}

const getStatusLabel = (status) => {
  const labels = {
    planned: t.value.planned,
    booked: t.value.booked,
    cancelled: t.value.cancelled,
  }
  return labels[status] || status
}

const savePlan = async () => {
  const originStop = stops.value.find(s => s.id === formData.value.originStopId || s.id === parseInt(formData.value.originStopId))
  const destinationStop = stops.value.find(s => s.id === formData.value.destinationStopId || s.id === parseInt(formData.value.destinationStopId))
  
  if (!originStop || !destinationStop) return

  const planData = {
    userId: USER_ID,
    date: formData.value.date,
    time: formData.value.time,
    originStop,
    destinationStop,
    reminderEnabled: formData.value.reminderEnabled,
    reminderMinutes: formData.value.reminderMinutes,
    status: 'upcoming',
  }

  try {
    if (formData.value.tripType === 'repeating') {
      await generateRepeatingTrips(planData)
    } else {
      await plannedTripService.create(planData)
    }
    const tripsData = await plannedTripService.getUpcoming(USER_ID)
    upcomingTrips.value = tripsData
  } catch (e) {
    error.value = 'Failed to save trip. Please try again.'
    console.error('Error saving planned trip:', e)
  }

  formData.value = {
    date: today,
    time: '08:00',
    originStopId: '',
    destinationStopId: '',
    tripType: 'one-time',
    repeatPattern: 'daily',
    reminderEnabled: false,
    reminderMinutes: 30,
  }
}

const generateRepeatingTrips = async (planData) => {
  const startDate = new Date(planData.date)
  const promises = []
  
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    const dayOfWeek = currentDate.getDay()
    
    let shouldAdd = false
    if (formData.value.repeatPattern === 'daily') {
      shouldAdd = true
    } else if (formData.value.repeatPattern === 'weekdays') {
      shouldAdd = dayOfWeek >= 1 && dayOfWeek <= 5
    } else if (formData.value.repeatPattern === 'weekends') {
      shouldAdd = dayOfWeek === 0 || dayOfWeek === 6
    }
    
    if (shouldAdd) {
      promises.push(plannedTripService.create({
        ...planData,
        date: currentDate.toISOString().split('T')[0],
      }))
    }
  }
  await Promise.all(promises)
}

const bookPlannedTrip = async (trip) => {
  store.selectedOriginStop = trip.originStop
  store.selectedDestinationStop = trip.destinationStop
  store.selectedDate = trip.date
  try {
    await plannedTripService.patch(trip.id, { status: 'booked' })
  } catch (e) {
    console.error('Error updating trip status:', e)
  }
  router.push('/express')
}

const deletePlannedTrip = async (id) => {
  try {
    await plannedTripService.remove(id)
    upcomingTrips.value = upcomingTrips.value.filter(t => t.id !== id)
  } catch (e) {
    error.value = 'Failed to delete trip.'
    console.error('Error deleting planned trip:', e)
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #212121;
}

html.dark .page-header h1 {
  color: var(--text);
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 16px;
}

html.dark .section-title {
  color: var(--text);
}

.plan-form-card {
  background: #FFF;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E8E8E8;
}

html.dark .plan-form-card {
  background: var(--surface);
  border-color: var(--border);
}

.plan-form-card h2 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 16px;
}

html.dark .plan-form-card h2 {
  color: var(--text);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #424242;
  margin-bottom: 6px;
}

html.dark .form-group label {
  color: var(--text);
}

.form-input, .form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  color: #212121;
  background: #FFF;
}

html.dark .form-input, html.dark .form-select {
  border-color: var(--border);
  color: var(--text);
  background: var(--bg);
}

html.dark .form-input:focus, html.dark .form-select:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15);
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #2E7D32;
}

.trip-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  background: #FFF;
  color: #757575;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

html.dark .type-btn {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text-muted);
}

.type-btn.active {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #2E7D32;
}

html.dark .type-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}

.repeat-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.repeat-btn {
  padding: 8px 16px;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  background: #FFF;
  color: #757575;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

html.dark .repeat-btn {
  border-color: var(--border);
  background: var(--surface);
  color: var(--text-muted);
}

.repeat-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

html.dark .repeat-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}

.reminder-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.reminder-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #424242;
}

html.dark .reminder-toggle label {
  color: var(--text);
}

html.dark .reminder-toggle input[type="checkbox"] {
  accent-color: var(--green);
}

.reminder-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2E7D32;
}

.reminder-select {
  padding: 6px 10px;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  font-size: 13px;
  width: auto;
  background: #FFF;
  color: #212121;
}

html.dark .reminder-select {
  border-color: var(--border);
  background: var(--bg);
  color: var(--text);
}

.reminder-text {
  font-size: 12px;
  color: #757575;
}

html.dark .reminder-text {
  color: var(--text-muted);
}

.btn-save-plan {
  width: 100%;
  padding: 14px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  margin-top: 8px;
}

html.dark .btn-save-plan {
  background: var(--green);
  color: #fff;
}

.btn-save-plan:hover {
  background: #1B5E20;
}

html.dark .btn-save-plan:hover {
  background: var(--green-dark);
}

.planned-trips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.planned-trip-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #FFF;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E8E8E8;
}

html.dark .planned-trip-card {
  background: var(--surface);
  border-color: var(--border);
}

.trip-date-box {
  width: 56px;
  height: 56px;
  background: #E8F5E9;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

html.dark .trip-date-box {
  background: var(--green-muted);
}

.trip-date-box .day {
  font-size: 20px;
  font-weight: 700;
  color: #2E7D32;
  line-height: 1;
}

html.dark .trip-date-box .day {
  color: var(--green);
}

.trip-date-box .month {
  font-size: 11px;
  font-weight: 500;
  color: #2E7D32;
  text-transform: uppercase;
}

html.dark .trip-date-box .month {
  color: var(--green);
}

.trip-details {
  flex: 1;
}

.trip-time {
  font-size: 14px;
  font-weight: 600;
  color: #212121;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

html.dark .trip-time {
  color: var(--text);
}

.trip-time i {
  color: #757575;
}

html.dark .trip-time i {
  color: var(--green);
}

.trip-route {
  font-size: 13px;
  color: #757575;
  margin-bottom: 4px;
}

html.dark .trip-route {
  color: var(--text-muted);
}

.trip-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.trip-status.planned {
  background: #FFF3E0;
  color: #F57C00;
}

.trip-status.booked {
  background: #E8F5E9;
  color: #2E7D32;
}

html.dark .trip-status.planned {
  background: rgba(245, 124, 0, 0.15);
  color: #FB923C;
}

html.dark .trip-status.booked {
  background: var(--green-muted);
  color: var(--green);
}

.trip-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-book-now {
  padding: 8px 12px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

html.dark .btn-book-now {
  background: var(--green);
  color: #fff;
}

.btn-book-now:hover {
  background: #1B5E20;
}

html.dark .btn-book-now:hover {
  background: var(--green-dark);
}

.btn-delete {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #FFCDD2;
  background: #FFF;
  color: #D32F2F;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

html.dark .btn-delete {
  border-color: rgba(239, 68, 68, 0.3);
  background: var(--surface);
  color: #EF4444;
}

.btn-delete:hover {
  background: #FFEBEE;
}

html.dark .btn-delete:hover {
  background: rgba(239, 68, 68, 0.15);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #757575;
}

html.dark .empty-state {
  color: var(--text-muted);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E0E0E0;
}

html.dark .empty-state i {
  color: var(--green);
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 8px;
}

html.dark .empty-state p {
  color: var(--text);
}

.empty-state .hint {
  font-size: 13px;
  color: #9E9E9E;
}

html.dark .empty-state .hint {
  color: var(--text-muted);
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
  border-color: var(--border);
  border-top-color: var(--green);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #C62828;
}

html.dark .error-banner {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #EF4444;
}

.error-banner button {
  margin-left: auto;
  padding: 6px 14px;
  background: #D32F2F;
  color: #FFF;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

html.dark .error-banner button {
  background: #EF4444;
}
</style>
