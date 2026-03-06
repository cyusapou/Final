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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

const setLanguage = (lang) => {
  store.currentLang = lang
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
  align-items: center;
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
</style>
