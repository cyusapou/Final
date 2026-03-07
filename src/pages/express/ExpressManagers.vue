<template>
  <PortalLayout
    :navItems="navItems"
    roleLabel="Express Admin"
    pageTitle="Managers"
    :userName="userName"
    :companyName="companyName"
    :unreadCount="unreadCount"
    @logout="handleLogout"
    @notifications="() => {}"
  >
    <div class="page-actions">
      <router-link to="/express/managers/new" class="btn-primary">
        <i class="fas fa-plus"></i> Create Manager
      </router-link>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      emptyIcon="fas fa-user-tie"
      emptyTitle="No managers yet"
      emptySubtitle="Create your first depot manager to get started"
      :onRowClick="row => $router.push(`/express/managers/${row.id}`)"
      @retry="loadData"
    >
      <template #empty-action>
        <router-link to="/express/managers/new" class="btn-primary">
          <i class="fas fa-plus"></i> Create Manager
        </router-link>
      </template>
      <template #cell-name="{ row }">
        <span class="name-cell">{{ row.firstName }} {{ row.lastName }}</span>
      </template>
      <template #cell-depot="{ row }">
        {{ row.depotName || '—' }}
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.isActive !== false ? 'active' : 'inactive'" />
      </template>
    </DataTable>
  </PortalLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PortalLayout from '../../components/shared/PortalLayout.vue'
import DataTable from '../../components/shared/DataTable.vue'
import StatusBadge from '../../components/shared/StatusBadge.vue'
import { useAuth } from '../../composables/useAuth.js'
import { userService } from '../../services/userService.js'
import { depotService } from '../../services/depotService.js'
import { notificationService } from '../../services/notificationService.js'
import { companyService } from '../../services/companyService.js'
import { navItems } from './expressNav.js'

const router = useRouter()
const auth = useAuth()
const cid = computed(() => auth.companyId.value)

const loading = ref(true)
const error = ref('')
const rows = ref([])
const unreadCount = ref(0)
const companyName = ref('')
const userName = computed(() => {
  const u = auth.currentUser.value
  return u ? `${u.firstName} ${u.lastName}` : ''
})

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'depot', label: 'Depot' },
  { key: 'status', label: 'Status', width: '100px' },
]

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [managers, depots, notifs, company] = await Promise.all([
      userService.getAll({ companyId: cid.value, role: 'manager' }),
      depotService.getByCompany(cid.value),
      notificationService.getUnread(auth.userId.value),
      companyService.getById(cid.value),
    ])
    const depotMap = Object.fromEntries(depots.map(d => [d.id, d.name]))
    rows.value = managers.map(m => ({ ...m, depotName: depotMap[m.depotId] || '' }))
    unreadCount.value = notifs.length
    companyName.value = company?.name || ''
  } catch {
    error.value = 'Failed to load managers'
  } finally {
    loading.value = false
  }
}

function handleLogout() { auth.logout('/express/login') }

onMounted(loadData)
</script>

<style scoped>
.page-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  background: #22c55e;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #16a34a; }
.name-cell { font-weight: 600; color: rgba(255,255,255,0.9); }
</style>
