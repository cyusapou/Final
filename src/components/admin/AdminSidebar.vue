<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-logo">
      <span class="logo-mark">OTG</span>
      <span class="logo-text" v-if="!collapsed">Admin</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="nav-item--active"
      >
        <span class="nav-icon"><i :class="item.icon"></i></span>
        <span class="nav-label" v-if="!collapsed">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="toggle-btn" @click="$emit('toggle')" :title="collapsed ? 'Expand' : 'Collapse'">
        <i :class="collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'"></i>
      </button>
      <button class="logout-btn" @click="logout" :title="collapsed ? 'Logout' : ''">
        <span><i class="fas fa-sign-out-alt"></i></span>
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../../store/index.js'

const props = defineProps({
  role: String,
  collapsed: Boolean
})

defineEmits(['toggle'])

const router = useRouter()

const navMap = {
  Driver: [
    { path: '/driver', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/driver/trip', icon: 'fas fa-bus', label: 'My Trip' },
    { path: '/driver/history', icon: 'fas fa-clipboard-list', label: 'History' },
    { path: '/driver/profile', icon: 'fas fa-user', label: 'Profile' },
  ],
  Manager: [
    { path: '/manager', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/manager/drivers', icon: 'fas fa-user-shield', label: 'Drivers' },
    { path: '/manager/trips', icon: 'fas fa-map', label: 'Trips' },
    { path: '/manager/schedule', icon: 'fas fa-calendar-alt', label: 'Schedule' },
    { path: '/manager/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
  ],
  Admin: [
    { path: '/admin', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/admin/managers', icon: 'fas fa-user-tie', label: 'Managers' },
    { path: '/admin/fleet', icon: 'fas fa-bus-alt', label: 'Fleet' },
    { path: '/admin/finance', icon: 'fas fa-coins', label: 'Finance' },
    { path: '/admin/routes', icon: 'fas fa-road', label: 'Routes' },
    { path: '/admin/complaints', icon: 'fas fa-bullhorn', label: 'Complaints' },
  ],
  SuperAdmin: [
    { path: '/rura', icon: 'fas fa-landmark', label: 'Overview' },
    { path: '/rura/expresses', icon: 'fas fa-building', label: 'Expresses' },
    { path: '/rura/compliance', icon: 'fas fa-clipboard-list', label: 'Compliance' },
    { path: '/rura/feedback', icon: 'fas fa-comment', label: 'Feedback' },
    { path: '/rura/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
    { path: '/rura/announcements', icon: 'fas fa-bullhorn', label: 'Announcements' },
    { path: '/rura/users', icon: 'fas fa-users', label: 'Users' },
  ],
}

const navItems = computed(() => {
  const roleKey = props.role || localStorage.getItem('userRole') || 'Driver'
  return navMap[roleKey] || []
})

function logout() {
  store.user = null
  store.token = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e8ecf1;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-logo {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e8ecf1;
  font-weight: 700;
  color: #1a202c;
}

.logo-mark {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  color: #1a202c;
}

.sidebar.collapsed .logo-text {
  display: none;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #5a6c7d;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f2f4f7;
  color: #2E7D32;
}

.nav-item--active {
  background: #e8f5e9;
  color: #2E7D32;
  font-weight: 600;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.nav-label {
  white-space: nowrap;
}

.sidebar.collapsed .nav-label {
  display: none;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e8ecf1;
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.toggle-btn,
.logout-btn {
  width: 100%;
  padding: 10px;
  border: 1px solid #e8ecf1;
  background: #f5f6fa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #5a6c7d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.toggle-btn:hover,
.logout-btn:hover {
  background: #eef2f7;
  border-color: #d0d7e0;
}

.logout-btn {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.logout-btn:hover {
  background: #ffcdd2;
}

.sidebar.collapsed .logout-btn span:last-child {
  display: none;
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.collapsed {
    transform: translateX(0);
    width: 280px;
  }
}

/* Dark mode */
html.dark .sidebar {
  background: var(--bg);
  border-color: var(--border);
  box-shadow: none;
}

html.dark .sidebar-logo {
  border-color: var(--border);
  color: var(--text);
}

html.dark .logo-mark {
  background: var(--green);
}

html.dark .logo-text {
  color: var(--text);
}

html.dark .nav-item {
  color: var(--text-muted);
}

html.dark .nav-item:hover {
  background: var(--hover);
  color: var(--green);
}

html.dark .nav-item--active {
  background: var(--green-muted);
  color: var(--green);
}

html.dark .sidebar-footer {
  border-color: var(--border);
}

html.dark .toggle-btn {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text-muted);
}

html.dark .toggle-btn:hover {
  background: var(--hover);
}

html.dark .logout-btn {
  background: var(--surface);
  border-color: var(--border);
  color: #ef4444;
}

html.dark .logout-btn:hover {
  background: var(--hover);
}

html.dark .sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border);
}

html.dark .sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
