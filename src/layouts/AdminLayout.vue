<template>
  <div class="admin-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <AdminSidebar :role="userRole" :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="admin-main">
      <AdminTopBar :user="currentUser" :role="userRole" />
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store/index.js'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminTopBar from '../components/admin/AdminTopBar.vue'

const router = useRouter()
const sidebarCollapsed = ref(false)

const currentRoute = useRoute()

const userRole = computed(() => {
  const stored = localStorage.getItem('userRole') || store.userRole
  if (stored) return stored
  const path = currentRoute.path
  if (path.startsWith('/rura')) return 'SuperAdmin'
  if (path.startsWith('/admin')) return 'Admin'
  if (path.startsWith('/manager')) return 'Manager'
  if (path.startsWith('/driver')) return 'Driver'
  return 'Driver'
})
const currentUser = computed(() => store.user || { firstName: 'Guest', lastName: '' })
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  background: #f5f6fa;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 100vw !important;
  width: 100%;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Override mobile body max-width constraint */
:global(body.admin-layout) {
  max-width: 100vw !important;
  width: 100%;
}

html.dark .admin-shell {
  background: #0a0a0a;
}

html.dark .admin-content {
  background: #0a0a0a;
}
</style>
