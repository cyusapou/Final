<template>
  <div class="page-container" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <div class="page-header">
      <h1>{{ t.myRoutineTrips }}</h1>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store, stops } from '../store/index.js'
import { translations } from '../translations/index.js'

const router = useRouter()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)
const routineTrips = computed(() => store.routineTrips)
const todaysRoutines = computed(() => store.getTodaysRoutines())

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
  daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri default
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
  const nameLower = name.toLowerCase()
  if (nameLower.includes('school')) return 'fas fa-graduation-cap'
  if (nameLower.includes('work')) return 'fas fa-briefcase'
  if (nameLower.includes('home')) return 'fas fa-home'
  if (nameLower.includes('market')) return 'fas fa-shopping-cart'
  return 'fas fa-map-marker-alt'
}

const getIconClass = (name) => {
  const nameLower = name.toLowerCase()
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

const saveRoutine = () => {
  const originStop = stops.find(s => s.id === parseInt(formData.value.originStopId))
  const destinationStop = stops.find(s => s.id === parseInt(formData.value.destinationStopId))
  
  if (!originStop || !destinationStop) return

  const routineData = {
    name: formData.value.name,
    originStop,
    destinationStop,
    usualDepartureTime: formData.value.usualDepartureTime,
    daysOfWeek: formData.value.daysOfWeek,
  }

  if (showEditModal.value && routineToEdit.value) {
    store.updateRoutineTrip(routineToEdit.value.id, routineData)
  } else {
    store.addRoutineTrip(routineData)
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

const deleteRoutine = () => {
  if (routineToDelete.value) {
    store.deleteRoutineTrip(routineToDelete.value.id)
  }
  showDeleteConfirm.value = false
  routineToDelete.value = null
}

const bookRoutine = (routine) => {
  // Pre-fill booking flow
  store.selectedOriginStop = routine.originStop
  store.selectedDestinationStop = routine.destinationStop
  store.selectedDate = new Date().toISOString().split('T')[0]
  
  // Navigate to express selection
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

.btn-add:hover {
  background: #1B5E20;
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

.routine-card.today {
  border-color: #2E7D32;
  background: #E8F5E9;
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

.routine-icon.icon-school {
  background: #E3F2FD;
  color: #1976D2;
}

.routine-icon.icon-work {
  background: #FFF3E0;
  color: #F57C00;
}

.routine-icon.icon-home {
  background: #E8F5E9;
  color: #2E7D32;
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

.routine-info .route {
  font-size: 13px;
  color: #757575;
  margin: 0;
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

.detail-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #424242;
}

.detail-row i {
  color: #757575;
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

.day-badge.active {
  background: #2E7D32;
  color: #FFF;
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

.btn-primary:hover {
  background: #1B5E20;
}

.btn-secondary {
  background: #FFF;
  color: #424242;
  border: 1px solid #E8E8E8;
}

.btn-secondary:hover {
  background: #F5F5F5;
}

.btn-danger {
  background: #FFF;
  color: #D32F2F;
  border: 1px solid #FFCDD2;
}

.btn-danger:hover {
  background: #FFEBEE;
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

.btn-book-now:hover {
  background: #1B5E20;
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

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #212121;
  margin: 0;
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

.day-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E8E8E8;
}

.modal-footer .btn-primary, .modal-footer .btn-secondary, .modal-footer .btn-danger {
  flex: 1;
}
</style>
