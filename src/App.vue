<template>
  <div class="app-layout" :class="{ 'dark': isDarkMode }">
    <!-- Always show app layout -->
    <div class="app-main">
      <!-- Desktop Sidebar / Mobile Bottom Nav -->
      <BottomNav />
      
      <!-- Location Tracker Modal -->
      <LocationTracker />
      
      <!-- Main Content -->
      <main class="main-content" :class="{ collapsed: !sidebarOpen }">
        <div class="content-wrapper">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import LocationTracker from './components/LocationTracker.vue'
import { store } from './store/index.js'

const sidebarOpen = computed(() => store.sidebarOpen)
const isAuthenticated = computed(() => store.token && store.user)

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
/* Global Styles */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* App Layout */
.app-layout {
  min-height: 100vh;
}

/* App Main - Flex layout for authenticated users */
.app-main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* Main Content - Mobile First (< 500px) - no sidebar margin */
.main-content {
  flex: 1;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 70px; /* Space for bottom nav on mobile */
  margin-left: 0;
}

/* Content Wrapper - Full width on mobile */
.content-wrapper {
  width: 100%;
  padding: 16px;
  max-width: 100%;
}

/* Desktop (>= 500px) - Account for fixed sidebar */
@media (min-width: 500px) {
  .main-content {
    margin-left: 220px;
    padding-bottom: 0;
    width: calc(100% - 220px);
    transition: margin-left 0.3s ease, width 0.3s ease;
    padding-bottom: 0;
  }
  
  .main-content.collapsed {
    margin-left: 60px;
    width: calc(100% - 60px);
  }
  
  .content-wrapper {
    padding: 24px;
    max-width: 100%;
  }
}

/* Large desktop: max width for readability */
@media (min-width: 1200px) {
  .content-wrapper {
    max-width: 100%;
  }
}
</style>
