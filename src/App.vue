<template>
  <div class="app-layout" :class="{ 'dark-mode': darkMode }">
    <!-- Desktop Sidebar / Mobile Bottom Nav -->
    <BottomNav />
    
    <!-- Main Content -->
    <main class="main-content" :class="{ collapsed: !sidebarOpen }">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { RouterView } from 'vue-router'
import BottomNav from './components/BottomNav.vue'
import { store } from './store/index.js'

const sidebarOpen = computed(() => store.sidebarOpen)
const darkMode = computed(() => store.darkMode)

// Apply dark mode to html element and watch for changes
const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
  }
}

// Watch for dark mode changes
watch(darkMode, (newVal) => {
  applyDarkMode(newVal)
}, { immediate: true })

// Also apply on mount in case it's already set
applyDarkMode(darkMode.value)
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
}

/* App Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
  transition: background-color 0.3s ease;
}

/* Main Content - Mobile First (< 500px) - no sidebar margin */
.main-content {
  flex: 1;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 70px; /* Space for bottom nav on mobile */
}

/* Content Wrapper - Full width on mobile */
.content-wrapper {
  width: 100%;
  padding: 16px;
}

/* Desktop (>= 500px) - Sidebar takes up space */
@media (min-width: 500px) {
  .main-content {
    margin-left: 220px; /* Sidebar width */
    padding-bottom: 0;
    width: calc(100% - 220px);
    transition: margin-left 0.3s ease, width 0.3s ease;
  }
  
  .main-content.collapsed {
    margin-left: 60px;
    width: calc(100% - 60px);
  }
  
  .content-wrapper {
    padding: 24px;
  }
}

/* Large desktop: max width for readability */
@media (min-width: 1200px) {
  .content-wrapper {
    max-width: 900px;
    margin: 0 auto;
  }
}
</style>
