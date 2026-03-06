# Dark Mode Code Examples - Before & After

## 📚 Real-World Component Examples

---

## Example 1: Simple Landing Page Hero Section

### ❌ BEFORE (Without Dark Mode)
```vue
<template>
  <div class="hero">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
    <button @click="handleClick">Get Started</button>
  </div>
</template>

<style scoped>
.hero {
  background: white;
  padding: 60px 20px;
  text-align: center;
}

h1 {
  font-size: 36px;
  color: #212121;
  margin-bottom: 16px;
}

p {
  font-size: 18px;
  color: #757575;
  margin-bottom: 32px;
}

button {
  background: #2E7D32;
  color: white;
  padding: 12px 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
}

button:hover {
  background: #1B5E20;
}
</style>
```

### ✅ AFTER (With Dark Mode)
```vue
<template>
  <div class="hero bg-white dark:bg-neutral-900 transition-colors">
    <h1 class="text-gray-900 dark:text-white text-4xl font-bold mb-4">
      {{ title }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 text-lg mb-8">
      {{ subtitle }}
    </p>
    <button class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white font-semibold px-8 py-3 rounded transition-colors">
      Get Started
    </button>
  </div>
</template>

<style scoped>
.hero {
  @apply py-16 px-4 text-center;
}
</style>
```

---

## Example 2: Booking Card Component

### ❌ BEFORE
```vue
<template>
  <div class="booking-card">
    <div class="card-header">
      <h3>{{ trip.company }}</h3>
      <span class="price">${{ trip.price }}</span>
    </div>
    <div class="card-body">
      <div class="time">{{ trip.departureTime }} - {{ trip.arrivalTime }}</div>
      <div class="route">{{ trip.origin }} → {{ trip.destination }}</div>
      <div class="seats">{{ trip.availableSeats }} seats available</div>
    </div>
    <button class="book-btn" @click="bookTrip">Book Now</button>
  </div>
</template>

<style scoped>
.booking-card {
  background: white;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.booking-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

h3 {
  color: #212121;
  font-size: 16px;
  font-weight: 600;
}

.price {
  color: #2E7D32;
  font-size: 18px;
  font-weight: 700;
}

.card-body {
  margin-bottom: 16px;
}

.time {
  color: #212121;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.route {
  color: #757575;
  font-size: 13px;
  margin-bottom: 4px;
}

.seats {
  color: #9CA3AF;
  font-size: 12px;
}

.book-btn {
  width: 100%;
  background: #2E7D32;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.book-btn:hover {
  background: #1B5E20;
}
</style>
```

### ✅ AFTER
```vue
<template>
  <div class="booking-card bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md dark:hover:shadow-dark-card transition-all">
    <div class="card-header flex justify-between items-center mb-3">
      <h3 class="text-gray-900 dark:text-white font-semibold text-base">
        {{ trip.company }}
      </h3>
      <span class="text-primary-600 dark:text-primary-400 font-bold text-lg">
        ${{ trip.price }}
      </span>
    </div>

    <div class="card-body mb-4">
      <div class="time text-gray-900 dark:text-white font-semibold text-sm mb-1">
        {{ trip.departureTime }} - {{ trip.arrivalTime }}
      </div>
      <div class="route text-gray-600 dark:text-gray-400 text-xs mb-1">
        {{ trip.origin }} → {{ trip.destination }}
      </div>
      <div class="seats text-gray-500 dark:text-gray-500 text-xs">
        {{ trip.availableSeats }} seats available
      </div>
    </div>

    <button 
      class="w-full bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white font-semibold py-2 rounded transition-colors"
      @click="bookTrip"
    >
      Book Now
    </button>
  </div>
</template>

<style scoped>
/* Minimal CSS, most styling via Tailwind utilities */
.booking-card {
  @apply transition-all duration-200;
}

.booking-card:hover {
  @apply shadow-lg dark:shadow-dark-card;
}
</style>
```

---

## Example 3: Form Input Component

### ❌ BEFORE
```vue
<template>
  <div class="form-group">
    <label>{{ label }}</label>
    <input 
      :type="type" 
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-input"
    />
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #BDBDBD;
  border-radius: 6px;
  background: white;
  color: #212121;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2E7D32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.error-text {
  display: block;
  margin-top: 4px;
  color: #C62828;
  font-size: 12px;
}
</style>
```

### ✅ AFTER
```vue
<template>
  <div class="form-group mb-6">
    <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {{ label }}
    </label>
    <input 
      :type="type" 
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
    />
    <span v-if="error" class="text-red-600 dark:text-red-400 text-xs mt-1 block">
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
/* All styling handled by Tailwind utilities */
</style>
```

---

## Example 4: Table Component

### ❌ BEFORE
```vue
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Destination</th>
        <th>Status</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="trip in trips" :key="trip.id">
        <td>{{ trip.date }}</td>
        <td>{{ trip.destination }}</td>
        <td :class="{ completed: trip.status === 'completed' }">
          {{ trip.status }}
        </td>
        <td>${{ trip.price }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

thead {
  background: #F5F5F5;
}

th {
  color: #424242;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
}

tr {
  border-bottom: 1px solid #E8E8E8;
}

tr:hover {
  background: #F5F5F5;
}

td {
  color: #212121;
  padding: 12px;
  font-size: 13px;
}

.completed {
  color: #2E7D32;
  font-weight: 600;
}
</style>
```

### ✅ AFTER
```vue
<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-gray-700">
          <th class="text-gray-900 dark:text-white px-4 py-3 text-left text-sm font-semibold">Date</th>
          <th class="text-gray-900 dark:text-white px-4 py-3 text-left text-sm font-semibold">Destination</th>
          <th class="text-gray-900 dark:text-white px-4 py-3 text-left text-sm font-semibold">Status</th>
          <th class="text-gray-900 dark:text-white px-4 py-3 text-left text-sm font-semibold">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="trip in trips" 
          :key="trip.id"
          class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <td class="text-gray-900 dark:text-white px-4 py-3 text-sm">{{ trip.date }}</td>
          <td class="text-gray-900 dark:text-white px-4 py-3 text-sm">{{ trip.destination }}</td>
          <td class="px-4 py-3 text-sm font-medium">
            <span 
              :class="{
                'text-green-600 dark:text-green-400': trip.status === 'completed',
                'text-amber-600 dark:text-amber-400': trip.status === 'pending',
                'text-red-600 dark:text-red-400': trip.status === 'cancelled'
              }"
            >
              {{ trip.status }}
            </span>
          </td>
          <td class="text-gray-900 dark:text-white px-4 py-3 text-sm font-medium">${{ trip.price }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Minimal CSS, Tailwind handles styling */
</style>
```

---

## Example 5: Alert/Notification Component

### ❌ BEFORE
```vue
<template>
  <div :class="['alert', `alert-${type}`]" v-if="show">
    <span class="alert-icon">
      <i :class="getIcon"></i>
    </span>
    <div class="alert-content">
      <p class="alert-title">{{ title }}</p>
      <p class="alert-message">{{ message }}</p>
    </div>
    <button @click="close" class="alert-close">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.alert-success {
  background: #E8F5E9;
  border: 1px solid #4CAF50;
  color: #2E7D32;
}

.alert-error {
  background: #FFEBEE;
  border: 1px solid #EF5350;
  color: #C62828;
}

.alert-warning {
  background: #FFF3E0;
  border: 1px solid #FFB74D;
  color: #E65100;
}

.alert-icon {
  margin-right: 12px;
  font-size: 20px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 13px;
}

.alert-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  margin-left: 12px;
}
</style>
```

### ✅ AFTER
```vue
<template>
  <div 
    v-if="show"
    :class="[
      'flex items-start gap-3 p-4 rounded-lg border mb-4 transition-all',
      {
        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300': type === 'success',
        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300': type === 'error',
        'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300': type === 'warning',
        'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300': type === 'info'
      }
    ]"
  >
    <i :class="[getIcon, 'text-lg mt-0.5 flex-shrink-0']"></i>
    <div class="flex-1">
      <p class="font-semibold text-sm">{{ title }}</p>
      <p class="text-xs mt-1 opacity-90">{{ message }}</p>
    </div>
    <button 
      @click="close"
      class="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  type: { type: String, default: 'info' },
  title: String,
  message: String,
  show: { type: Boolean, default: true }
})

const emit = defineEmits(['close'])

const getIcon = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-warning',
    info: 'fas fa-info-circle'
  }
  return icons[props.type] || icons.info
})

const close = () => emit('close')
</script>

<style scoped>
/* All styling handled by Tailwind utilities */
</style>
```

---

## Summary: Migration Pattern

### General Pattern
```
Old Approach:
- Inline styles or separate CSS classes for light mode
- Separate dark mode CSS selectors
- Manual color values

New Approach:
- Use Tailwind's dark: prefix utilities
- Single className attribute with both light and dark variants
- Automatic transitions with transition-* utilities
- CSS variables for consistency
```

### Key Changes
1. **Replace color classes** with Tailwind utilities
2. **Add dark: variants** for all utilities that change in dark mode
3. **Use Tailwind's spacing utilities** (px-*, py-*, p-*, etc.)
4. **Use transition-colors** for smooth theme switching
5. **Remove scoped styles** where Tailwind utilities can handle them

---

## ✅ Checklist for Converting Components

- [ ] Replace all color hex codes with Tailwind classes
- [ ] Add `dark:` prefix to color utilities
- [ ] Replace flex/grid CSS with Tailwind utilities
- [ ] Replace padding/margin CSS with Tailwind utilities
- [ ] Remove unnecessary scoped styles
- [ ] Add transition-colors or transition-all
- [ ] Test in both light and dark modes
- [ ] Verify text contrast (WCAG AA: 4.5:1)
- [ ] Check hover and focus states work in both modes
- [ ] Verify images/icons are visible in both modes

