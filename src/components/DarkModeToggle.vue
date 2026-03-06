<template>
  <button 
    @click="toggleDarkMode"
    :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    class="dark-mode-toggle"
    :class="{ active: isDarkMode }"
    aria-label="Toggle dark mode"
  >
    <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../store/index.js'

const isDarkMode = computed(() => store.isDarkMode)

const toggleDarkMode = () => {
  store.toggleDarkMode()
}
</script>

<style scoped>
.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  min-width: auto;
  height: 36px;
}

.dark-mode-toggle:hover {
  background: #f3f4f6;
  color: #111827;
}

.dark-mode-toggle i {
  font-size: 16px;
  width: 16px;
  text-align: center;
}

.dark-mode-toggle span {
  white-space: nowrap;
}

/* Dark mode styles */
.dark .dark-mode-toggle {
  background: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.dark .dark-mode-toggle:hover {
  background: #4b5563;
  color: #e5e5e5;
}

/* Active state for dark mode */
.dark-mode-toggle.active {
  background: #2E7D32;
  color: white;
  border-color: #2E7D32;
}

.dark .dark-mode-toggle.active {
  background: #4b5563;
  border-color: #4b5563;
}

.dark-mode-toggle.active:hover {
  background: #1b5e20;
}

.dark .dark-mode-toggle.active:hover {
  background: #374151;
}
</style>
