<template>
  <div class="page-container" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="page-header">
      <h1>{{ t.planFutureTrip }}</h1>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store, stops } from '../store/index.js'
import { translations } from '../translations/index.js'

const router = useRouter()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)
const upcomingTrips = computed(() => store.getUpcomingPlannedTrips())

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

const savePlan = () => {
  const originStop = stops.find(s => s.id === parseInt(formData.value.originStopId))
  const destinationStop = stops.find(s => s.id === parseInt(formData.value.destinationStopId))
  
  if (!originStop || !destinationStop) return

  const planData = {
    date: formData.value.date,
    time: formData.value.time,
    originStop,
    destinationStop,
    reminderEnabled: formData.value.reminderEnabled,
    reminderMinutes: formData.value.reminderMinutes,
  }

  if (formData.value.tripType === 'repeating') {
    // Generate multiple planned trips based on repeat pattern
    generateRepeatingTrips(planData)
  } else {
    store.addPlannedTrip(planData)
  }

  // Reset form
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

const generateRepeatingTrips = (planData) => {
  const startDate = new Date(planData.date)
  const days = []
  
  for (let i = 0; i < 14; i++) { // Generate for next 2 weeks
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
      store.addPlannedTrip({
        ...planData,
        date: currentDate.toISOString().split('T')[0],
      })
    }
  }
}

const bookPlannedTrip = (trip) => {
  store.selectedOriginStop = trip.originStop
  store.selectedDestinationStop = trip.destinationStop
  store.selectedDate = trip.date
  store.updatePlannedTripStatus(trip.id, 'booked')
  router.push('/express')
}

const deletePlannedTrip = (id) => {
  store.deletePlannedTrip(id)
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

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 16px;
}

.plan-form-card {
  background: #FFF;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E8E8E8;
}

.plan-form-card h2 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 16px;
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

.form-input, .form-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  color: #212121;
  background: #FFF;
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

.type-btn.active {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #2E7D32;
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

.repeat-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
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
}

.reminder-text {
  font-size: 12px;
  color: #757575;
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

.btn-save-plan:hover {
  background: #1B5E20;
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

.trip-date-box .day {
  font-size: 20px;
  font-weight: 700;
  color: #2E7D32;
  line-height: 1;
}

.trip-date-box .month {
  font-size: 11px;
  font-weight: 500;
  color: #2E7D32;
  text-transform: uppercase;
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

.trip-time i {
  color: #757575;
}

.trip-route {
  font-size: 13px;
  color: #757575;
  margin-bottom: 4px;
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

.btn-book-now:hover {
  background: #1B5E20;
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

.btn-delete:hover {
  background: #FFEBEE;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #757575;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #E0E0E0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 8px;
}

.empty-state .hint {
  font-size: 13px;
  color: #9E9E9E;
}
</style>
