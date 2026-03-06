<template>
  <button 
    @click="toggleDarkMode"
    :title="darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    class="dark-mode-toggle"
    :class="{ active: darkMode }"
    aria-label="Toggle dark mode"
  >
    {{ darkMode ? 'Light' : 'Dark' }}
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../store/index.js'

const darkMode = computed(() => store.darkMode)

const toggleDarkMode = () => {
  store.toggleDarkMode()
}
</script>

<style scoped>
.dark-mode-toggle {
  width: auto;
  min-width: 60px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  padding: 0 12px;
}

.dark-mode-toggle:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.dark-mode-toggle.active {
  background: #FFA500;
  color: white;
  border-color: #FFA500;
}

.dark-mode-toggle.active:hover {
  background: #FF8C00;
  border-color: #FF8C00;
}

/* Tailwind dark mode */
@media (prefers-color-scheme: dark) {
  .dark-mode-toggle {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }
  
  .dark-mode-toggle:hover {
    background: var(--bg-tertiary);
  }
}
</style>
