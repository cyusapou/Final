<template>
  <PortalLayout
    :nav-items="navItems"
    role-label="Manager"
    page-title="Workers"
    :user-name="userName"
    :unread-count="unreadCount"
    @logout="handleLogout"
    @notifications="() => {}"
  >
    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      empty-icon="fas fa-hard-hat"
      empty-title="No workers yet"
      empty-subtitle="Add your first worker to get started"
      @retry="loadWorkers"
    >
      <template #empty-action>
        <router-link to="/manager/workers/new" class="btn-add">
          <i class="fas fa-plus"></i> Add Worker
        </router-link>
      </template>

      <template #cell-name="{ row }">
        <span class="worker-name">{{ row.name }}</span>
      </template>

      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>

    <router-link to="/manager/workers/new" class="fab">
      <i class="fas fa-plus"></i>
    </router-link>
  </PortalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PortalLayout from '../../components/shared/PortalLayout.vue'
import DataTable from '../../components/shared/DataTable.vue'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import { useAuth } from '../../composables/useAuth.js'
import { userService } from '../../services/userService.js'
import { workerService } from '../../services/workerService.js'
import { notificationService } from '../../services/notificationService.js'

const auth = useAuth()

const navItems = [
  { path: '/manager', icon: 'fas fa-chart-pie', label: 'Dashboard', exact: true },
  { path: '/manager/drivers', icon: 'fas fa-id-card', label: 'Drivers' },
  { path: '/manager/workers', icon: 'fas fa-hard-hat', label: 'Workers' },
  { path: '/manager/trips', icon: 'fas fa-route', label: 'Trips' },
  { path: '/manager/buses', icon: 'fas fa-bus', label: 'Buses' },
  { path: '/manager/expenses', icon: 'fas fa-receipt', label: 'Expenses' },
  { path: '/manager/salaries', icon: 'fas fa-money-bill-wave', label: 'Salaries' },
  { path: '/manager/incidents', icon: 'fas fa-exclamation-triangle', label: 'Incidents' },
]

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'assignedBus', label: 'Assigned Bus' },
  { key: 'status', label: 'Status' },
]

const loading = ref(true)
const error = ref('')
const rows = ref([])
const unreadCount = ref(0)

const userName = computed(() => {
  const u = auth.currentUser.value
  return u ? `${u.firstName} ${u.lastName}` : ''
})

async function loadWorkers() {
  loading.value = true
  error.value = ''
  try {
    const depotId = auth.depotId.value
    const companyId = auth.companyId.value

    const [workerUsers, workerRecords, notifications] = await Promise.all([
      userService.getAll({ role: 'worker', depotId }),
      workerService.getAll({ companyId }),
      notificationService.getUnread(auth.userId.value),
    ])

    unreadCount.value = notifications.length

    const workerMap = {}
    workerRecords.forEach(w => { workerMap[w.userId] = w })

    rows.value = workerUsers.map(u => {
      const rec = workerMap[u.id] || {}
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        phone: u.phone || '—',
        assignedBus: rec.busPlate || '—',
        status: u.status || 'active',
      }
    })
  } catch {
    error.value = 'Failed to load workers. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  auth.logout('/manager/login')
}

onMounted(loadWorkers)
</script>

<style scoped>
.worker-name { font-weight: 600; }

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #22c55e;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.btn-add:hover { background: #16a34a; }

.fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #22c55e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(34,197,94,0.35);
  transition: background 0.2s, transform 0.15s;
  z-index: 30;
}
.fab:hover { background: #16a34a; transform: scale(1.05); }
</style>
