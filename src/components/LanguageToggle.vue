<template>
  <div class="toggle-container">
    <div class="lang-toggle">
      <button 
        v-for="lang in ['en', 'rw', 'fr']" 
        :key="lang"
        :class="['lang-btn', { active: currentLang === lang }]"
        @click="setLanguage(lang)"
      >
        {{ lang.toUpperCase() }}
      </button>
    </div>
    <button class="theme-btn" @click="toggleDarkMode" :title="darkMode ? 'Light Mode' : 'Dark Mode'">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'

const currentLang = computed(() => store.currentLang)
const darkMode = computed(() => store.darkMode)

const t = computed(() => translations[currentLang.value])

const setLanguage = (lang) => {
  store.currentLang = lang
}

const toggleDarkMode = () => {
  store.darkMode = !store.darkMode
  localStorage.setItem('darkMode', String(store.darkMode))
}
</script>

<style scoped>
.toggle-container {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.lang-toggle {
  display: flex;
  gap: 6px;
}

.lang-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: var(--bg-tertiary);
}

.lang-btn.active {
  background: #2E7D32;
  color: #FFF;
  border-color: #2E7D32;
}

.theme-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.theme-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
