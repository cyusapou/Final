# Dark Mode Forced - Quick Code Reference

## Key Code Changes

### 1. App.vue - Force Dark Class on Mount

```vue
<!-- BEFORE: Conditional app-layout -->
<template>
  <div class="app-layout" :class="{ 'dark-mode': darkMode }">

<!-- AFTER: Always dark -->
<template>
  <div class="app-layout dark-mode">
```

```javascript
// BEFORE: Watch store and conditionally apply
const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.add('dark-mode')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.remove('dark-mode')
  }
}

watch(darkMode, (newVal) => {
  applyDarkMode(newVal)
}, { immediate: true })

onMounted(() => {
  applyDarkMode(darkMode.value)
})

// AFTER: Always apply dark
onMounted(() => {
  document.documentElement.classList.add('dark')
  document.documentElement.classList.add('dark-mode')
})
```

---

### 2. LanguageToggle.vue - Remove Theme Toggle

```vue
<!-- REMOVED: Theme toggle button -->
<button 
  class="theme-btn" 
  @click="toggleDarkMode" 
  :title="darkMode ? 'Light Mode' : 'Dark Mode'"
  aria-label="Toggle dark mode"
>
  <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
</button>

<!-- REMOVED: Computed properties -->
const darkMode = computed(() => store.darkMode)

<!-- REMOVED: Function -->
const toggleDarkMode = () => {
  store.toggleDarkMode()
}

<!-- REMOVED: CSS classes -->
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
```

---

### 3. LanguageToggle.vue - Final Component

```vue
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
```

---

## Dark Mode Styling Already Applied Across All Pages

### Pattern 1: Page Wrapper
```vue
<!-- Every page uses this pattern -->
<div class="page-wrapper bg-white dark:bg-neutral-900 transition-colors">
```

### Pattern 2: Text Colors
```vue
<!-- Headers -->
<h1 class="text-gray-900 dark:text-white">Title</h1>

<!-- Descriptions -->
<p class="text-gray-700 dark:text-gray-300">Text</p>

<!-- Muted text -->
<span class="text-gray-600 dark:text-gray-400">Muted</span>
```

### Pattern 3: Cards
```vue
<!-- Card containers -->
<div class="card bg-white dark:bg-neutral-800 border border-gray-200 dark:border-gray-700">
```

### Pattern 4: Buttons
```vue
<!-- Primary buttons -->
<button class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white">

<!-- Secondary buttons -->
<button class="bg-white dark:bg-neutral-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400">
```

### Pattern 5: Inputs
```vue
<!-- Form inputs -->
<input 
  class="bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
>
```

---

## Global CSS Variables (Already Set)

Located in `src/style.css`:

```css
:root {
  /* Light mode (not used anymore) */
  --bg-primary: #FFFFFF;
  --text-primary: #212121;
  --border-color: #E8E8E8;
}

:root.dark-mode,
html.dark {
  /* Dark mode (always active now) */
  --bg-primary: #121212;
  --bg-secondary: #1E1E1E;
  --bg-tertiary: #2C2C2C;
  --text-primary: #E8E8E8;
  --text-secondary: #B0B0B0;
  --text-tertiary: #808080;
  --border-color: #2C2C2C;
}
```

---

## Tailwind Config (Already Set)

From `tailwind.config.js`:

```javascript
export default {
  darkMode: 'class',  // Uses 'dark' class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        neutral: {
          50: '#F9FAFB',
          800: '#1F2937',
          900: '#111827',
        },
      },
    },
  },
}
```

---

## Summary of Modifications

| File | Change Type | Status |
|------|-------------|--------|
| src/App.vue | Forced 'dark' class on mount | ✅ Modified |
| src/components/LanguageToggle.vue | Removed theme toggle button | ✅ Modified |
| src/pages/*.vue | Dark mode classes already applied | ✅ Already in place |
| style.css | CSS variables already set | ✅ Already in place |
| tailwind.config.js | Dark mode strategy configured | ✅ Already in place |

---

## Result

Dark mode is now **globally forced** on the entire app:
- ✅ No toggle button visible
- ✅ All pages render in dark mode
- ✅ Language selector still works
- ✅ Professional dark green-to-black aesthetic maintained
- ✅ All text is readable with good contrast
- ✅ Green accents preserved for brand identity
