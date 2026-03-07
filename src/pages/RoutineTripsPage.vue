<template>
  <div class="page-container bg-white dark:bg-neutral-950 transition-colors" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="page-header">
      <h1>{{ t.myRoutineTrips }}</h1>
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

    <!-- Today's Routines -->
    <div v-if="todaysRoutines.length > 0" class="section">
      <h2 class="section-title">{{ t.upcomingToday }}</h2>
      <div class="routines-list">
        <div v-for="routine in todaysRoutines" :key="routine.id" class="routine-card today">
          <div class="routine-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="routine-info">
            <h3>{{ routine.name }}</h3>
            <p class="route">{{ routine.originStop.name }} → {{ routine.destinationStop.name }}</p>
            <p class="time">{{ routine.usualDepartureTime }}</p>
          </div>
          <button class="btn-book-now" @click="bookRoutine(routine)">
            {{ t.bookNow }}
          </button>
        </div>
      </div>
    </div>

    <!-- All Routines -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">{{ t.myRoutineTrips }}</h2>
        <button class="btn-add" @click="showCreateModal = true">
          <i class="fas fa-plus"></i> {{ t.createRoutineTrip }}
        </button>
      </div>

      <div v-if="routineTrips.length === 0" class="empty-state">
        <i class="fas fa-bookmark"></i>
        <p>{{ t.noRoutineTrips }}</p>
        <p class="hint">{{ t.addYourFirst }}</p>
      </div>

      <div v-else class="routines-list">
        <div v-for="routine in routineTrips" :key="routine.id" class="routine-card">
          <div class="routine-header">
            <div class="routine-icon" :class="getIconClass(routine.name)">
              <i :class="getIcon(routine.name)"></i>
            </div>
            <div class="routine-info">
              <h3>{{ routine.name }}</h3>
              <p class="route">{{ routine.originStop.name }} → {{ routine.destinationStop.name }}</p>
            </div>
          </div>
          
          <div class="routine-details">
            <div class="detail-row">
              <i class="fas fa-clock"></i>
              <span>{{ routine.usualDepartureTime }}</span>
            </div>
            <div class="days-badges">
              <span 
                v-for="day in routine.daysOfWeek" 
                :key="day" 
                class="day-badge"
                :class="{ active: isToday(day) }"
              >
                {{ getDayLabel(day) }}
              </span>
            </div>
          </div>

          <div class="routine-actions">
            <button class="btn-primary" @click="bookRoutine(routine)">
              <i class="fas fa-ticket-alt"></i> {{ t.bookNow }}
            </button>
            <button class="btn-secondary" @click="editRoutine(routine)">
              <i class="fas fa-edit"></i> {{ t.edit }}
            </button>
            <button class="btn-danger" @click="confirmDelete(routine)">
              <i class="fas fa-trash"></i> {{ t.delete }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ showEditModal ? t.edit : t.createRoutineTrip }}</h2>
          <button class="btn-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>{{ t.routineName }}</label>
            <input 
              v-model="formData.name" 
              type="text" 
              :placeholder="t.e.gSchool"
              class="form-input"
            />
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

          <div class="form-group">
            <label>{{ t.usualDepartureTime }}</label>
            <input 
              v-model="formData.usualDepartureTime" 
              type="time" 
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>{{ t.daysOfWeek }}</label>
            <div class="days-selector">
              <button 
                v-for="(day, index) in daysOfWeek" 
                :key="index"
                :class="['day-btn', { active: formData.daysOfWeek.includes(index) }]"
                @click="toggleDay(index)"
              >
                {{ day }}
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">{{ t.cancel }}</button>
          <button class="btn-primary" @click="saveRoutine">{{ t.save }}</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal modal-small">
        <div class="modal-body">
          <p>{{ t.confirmDelete }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteConfirm = false">{{ t.cancel }}</button>
          <button class="btn-danger" @click="deleteRoutine">{{ t.delete }}</button>
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
import { routineTripService } from '../services/routineTripService.js'
import { stopService } from '../services/stopService.js'

const USER_ID = 'u001'
const router = useRouter()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)

const stops = ref([])
const routineTrips = ref([])
const isLoading = ref(false)
const error = ref(null)

const todaysRoutines = computed(() => {
  const today = new Date().getDay()
  return routineTrips.value.filter(trip => 
    trip.daysOfWeek && trip.daysOfWeek.includes(today)
  )
})

const loadData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const [stopsData, tripsData] = await Promise.all([
      stopService.getAll(),
      routineTripService.getByUser(USER_ID),
    ])
    stops.value = stopsData
    routineTrips.value = tripsData
  } catch (e) {
    error.value = 'Failed to load data. Please try again.'
    console.error('Error loading routine trips:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const routineToDelete = ref(null)
const routineToEdit = ref(null)

const daysOfWeek = computed(() => {
  const days = currentLang.value === 'en' 
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return days
})

const formData = ref({
  name: '',
  originStopId: '',
  destinationStopId: '',
  usualDepartureTime: '08:00',
  daysOfWeek: [1, 2, 3, 4, 5],
})

const getDayLabel = (day) => {
  const labels = currentLang.value === 'en' 
    ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return labels[day]
}

const isToday = (day) => {
  return new Date().getDay() === day
}

const getIcon = (name) => {
  const nameLower = (name || '').toLowerCase()
  if (nameLower.includes('school')) return 'fas fa-graduation-cap'
  if (nameLower.includes('work')) return 'fas fa-briefcase'
  if (nameLower.includes('home')) return 'fas fa-home'
  if (nameLower.includes('market')) return 'fas fa-shopping-cart'
  return 'fas fa-map-marker-alt'
}

const getIconClass = (name) => {
  const nameLower = (name || '').toLowerCase()
  if (nameLower.includes('school')) return 'icon-school'
  if (nameLower.includes('work')) return 'icon-work'
  if (nameLower.includes('home')) return 'icon-home'
  return 'icon-default'
}

const toggleDay = (day) => {
  const index = formData.value.daysOfWeek.indexOf(day)
  if (index === -1) {
    formData.value.daysOfWeek.push(day)
  } else {
    formData.value.daysOfWeek.splice(index, 1)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    originStopId: '',
    destinationStopId: '',
    usualDepartureTime: '08:00',
    daysOfWeek: [1, 2, 3, 4, 5],
  }
}

const saveRoutine = async () => {
  const originStop = stops.value.find(s => s.id === formData.value.originStopId || s.id === parseInt(formData.value.originStopId))
  const destinationStop = stops.value.find(s => s.id === formData.value.destinationStopId || s.id === parseInt(formData.value.destinationStopId))
  
  if (!originStop || !destinationStop) return

  const routineData = {
    userId: USER_ID,
    name: formData.value.name,
    originStop,
    destinationStop,
    usualDepartureTime: formData.value.usualDepartureTime,
    daysOfWeek: formData.value.daysOfWeek,
    isActive: true,
  }

  try {
    if (showEditModal.value && routineToEdit.value) {
      await routineTripService.update(routineToEdit.value.id, { ...routineToEdit.value, ...routineData })
      const idx = routineTrips.value.findIndex(rt => rt.id === routineToEdit.value.id)
      if (idx !== -1) routineTrips.value[idx] = { ...routineTrips.value[idx], ...routineData }
    } else {
      const created = await routineTripService.create(routineData)
      routineTrips.value.push(created)
    }
  } catch (e) {
    error.value = 'Failed to save routine trip.'
    console.error('Error saving routine trip:', e)
  }

  closeModal()
}

const editRoutine = (routine) => {
  routineToEdit.value = routine
  formData.value = {
    name: routine.name,
    originStopId: routine.originStop.id,
    destinationStopId: routine.destinationStop.id,
    usualDepartureTime: routine.usualDepartureTime,
    daysOfWeek: [...routine.daysOfWeek],
  }
  showEditModal.value = true
}

const confirmDelete = (routine) => {
  routineToDelete.value = routine
  showDeleteConfirm.value = true
}

const deleteRoutine = async () => {
  if (routineToDelete.value) {
    try {
      await routineTripService.remove(routineToDelete.value.id)
      routineTrips.value = routineTrips.value.filter(t => t.id !== routineToDelete.value.id)
    } catch (e) {
      error.value = 'Failed to delete routine trip.'
      console.error('Error deleting routine trip:', e)
    }
  }
  showDeleteConfirm.value = false
  routineToDelete.value = null
}

const bookRoutine = (routine) => {
  store.selectedOriginStop = routine.originStop
  store.selectedDestinationStop = routine.destinationStop
  store.selectedDate = new Date().toISOString().split('T')[0]
  router.push('/express')
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 12px;
}

html.dark .section-title {
  color: var(--text);
}

.section-header .section-title {
  margin-bottom: 0;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

html.dark .btn-add {
  background: var(--surface);
  border: 1px solid var(--border);
}

.btn-add:hover {
  background: #1B5E20;
}

html.dark .btn-add:hover {
  background: var(--hover);
}

.routines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.routine-card {
  background: #FFF;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #E8E8E8;
}

html.dark .routine-card {
  background: var(--surface);
  border-color: var(--border);
}

.routine-card.today {
  border-color: #2E7D32;
  background: #E8F5E9;
}

html.dark .routine-card.today {
  background: var(--green-muted);
  border-color: var(--green);
}

.routine-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.routine-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  color: #757575;
  flex-shrink: 0;
}

html.dark .routine-icon {
  background: var(--surface);
  color: var(--text-muted);
}

.routine-icon.icon-school {
  background: #E3F2FD;
  color: #1976D2;
}

html.dark .routine-icon.icon-school {
  background: rgba(59, 130, 246, 0.15);
  color: #60A5FA;
}

.routine-icon.icon-work {
  background: #FFF3E0;
  color: #F57C00;
}

html.dark .routine-icon.icon-work {
  background: rgba(251, 146, 60, 0.15);
  color: #FB923C;
}

.routine-icon.icon-home {
  background: #E8F5E9;
  color: #2E7D32;
}

html.dark .routine-icon.icon-home {
  background: var(--green-muted);
  color: var(--green);
}

.routine-info {
  flex: 1;
}

.routine-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
  margin: 0 0 4px;
}

html.dark .routine-info h3 {
  color: var(--text);
}

.routine-info .route {
  font-size: 13px;
  color: #757575;
  margin: 0;
}

html.dark .routine-info .route {
  color: rgba(255, 255, 255, 0.5);
}

.routine-details {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #F5F5F5;
  border-bottom: 1px solid #F5F5F5;
}

html.dark .routine-details {
  border-top-color: var(--border);
  border-bottom-color: var(--border);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #424242;
}

html.dark .detail-row {
  color: var(--text);
}

.detail-row i {
  color: #757575;
}

html.dark .detail-row i {
  color: var(--green);
}

.days-badges {
  display: flex;
  gap: 4px;
}

.day-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  background: #F5F5F5;
  color: #757575;
}

html.dark .day-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.day-badge.active {
  background: #2E7D32;
  color: #FFF;
}

html.dark .day-badge.active {
  background: var(--green);
  color: #fff;
}

.routine-actions {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary, .btn-danger {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: #2E7D32;
  color: #FFF;
  border: none;
}

html.dark .btn-primary {
  background: var(--green);
  color: #fff;
}

.btn-primary:hover {
  background: #1B5E20;
}

html.dark .btn-primary:hover {
  background: var(--green-dark);
}

.btn-secondary {
  background: #FFF;
  color: #424242;
  border: 1px solid #E8E8E8;
}

html.dark .btn-secondary {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

.btn-secondary:hover {
  background: #F5F5F5;
}

html.dark .btn-secondary:hover {
  background: var(--hover);
}

.btn-danger {
  background: #FFF;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
}

html.dark .btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  background: #FFEBEE;
}

html.dark .btn-danger:hover {
  background: rgba(239, 68, 68, 0.25);
}

.btn-book-now {
  padding: 8px 16px;
  background: #2E7D32;
  color: #FFF;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #FFF;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

html.dark .modal {
  background: var(--surface);
}

.modal-small {
  max-width: 360px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #E8E8E8;
}

html.dark .modal-header {
  border-bottom-color: var(--border);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin: 0;
}

html.dark .modal-header h2 {
  color: var(--text);
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #F5F5F5;
  color: #757575;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

html.dark .btn-close {
  background: var(--bg);
  color: var(--text-muted);
}

.modal-body {
  padding: 20px;
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

.days-selector {
  display: flex;
  gap: 8px;
}

.day-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #E8E8E8;
  background: #FFF;
  color: #757575;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

html.dark .day-btn {
  border-color: var(--border);
  background: var(--bg);
  color: var(--text-muted);
}

.day-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

html.dark .day-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E8E8E8;
}

html.dark .modal-footer {
  border-top-color: var(--border);
}

html.dark .empty-state {
  color: var(--text-muted);
}

html.dark .empty-state i {
  color: var(--green);
}

html.dark .empty-state p {
  color: var(--text);
}

html.dark .empty-state .hint {
  color: var(--text-muted);
}

.modal-footer .btn-primary, .modal-footer .btn-secondary, .modal-footer .btn-danger {
  flex: 1;
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
