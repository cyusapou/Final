<template>
  <div class="app-layout" :class="{ 'dark': isDarkMode }">
    <div class="app-main">
      <!-- Passenger sidebar/nav — hidden on worker/driver/admin/manager/rura routes -->
      <BottomNav v-if="showPassengerNav" />
      <LocationTracker v-if="showPassengerNav" />

      <!-- Main Content -->
      <main class="main-content" :class="{ collapsed: !sidebarOpen, 'no-sidebar': !showPassengerNav }">
        <div class="content-wrapper">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import LocationTracker from './components/LocationTracker.vue'
import { store } from './store/index.js'

const route = useRoute()
const sidebarOpen = computed(() => store.sidebarOpen)
const isAuthenticated = computed(() => store.token && store.user)

const showPassengerNav = computed(() => {
  const path = route.path
  return !path.startsWith('/unauthorized') && !path.startsWith('/test-login')
})

// Dark mode state
const isDarkMode = computed(() => store.isDarkMode)

// Initialize dark mode from localStorage
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    store.isDarkMode = savedDarkMode === 'true'
  }
  
  // Apply dark mode class to document
  updateDarkModeClass()
})

// Watch for dark mode changes and update document class
watch(isDarkMode, () => {
  updateDarkModeClass()
  // Save to localStorage
  localStorage.setItem('darkMode', isDarkMode.value.toString())
})

const updateDarkModeClass = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
</script>

<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.app-layout {
  min-height: 100vh;
  background-color: var(--bg-secondary);
  transition: background-color 0.3s ease;
}

.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 70px;
  margin-left: 0;
  transition: margin-left 0.3s ease, width 0.3s ease;
}

.content-wrapper {
  width: 100%;
  padding: 0;
  max-width: 100%;
}

.main-content.no-sidebar {
  margin-left: 0 !important;
  width: 100% !important;
  padding-bottom: 0;
}

@media (min-width: 500px) {
  .main-content {
    margin-left: 220px;
    padding-bottom: 0;
    width: calc(100% - 220px);
  }

  .main-content.collapsed {
    margin-left: 60px;
    width: calc(100% - 60px);
  }

  .main-content.no-sidebar {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .content-wrapper {
    padding: 0;
  }
}
</style>
