<template>
  <button
    @click="toggleDarkMode"
    :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    class="dark-toggle"
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
.dark-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.dark-toggle:hover {
  background: var(--bg-tertiary);
  color: var(--primary-green);
  border-color: var(--primary-green);
}
</style>
