# Dark Mode Page Update Checklist

This document provides guidance for updating all pages and components to support dark mode.

## Pages to Update

### Priority 1: Core Pages (Essential)
- [x] App.vue - Root component (DONE)
- [x] BottomNav.vue - Navigation (DONE)
- [ ] LandingPage.vue - Home page
- [ ] AuthGatePage.vue - Auth gate
- [ ] BookingPage.vue - Booking flow
- [ ] PaymentPage.vue - Payment page

### Priority 2: Feature Pages
- [ ] ExpressPage.vue - Express booking
- [ ] DestinationPage.vue - Destination selection
- [ ] TrackPage.vue - Bus tracking
- [ ] TripsPage.vue - Trip listing
- [ ] RoutineTripsPage.vue - Routine trips
- [ ] PlannerPage.vue - Trip planner
- [ ] SummaryPage.vue - Booking summary

### Priority 3: User Pages
- [ ] AccountPage.vue - User account
- [ ] RecentBookingsPage.vue - Recent bookings

### Priority 4: Admin Pages
- [ ] Admin pages in driver/, express-admin/, manager/, rura/ folders

### Priority 5: Components
- [ ] All components in src/components/ folder

## Update Strategy

### Quick Update Pattern

For each component/page, use this pattern:

```vue
<template>
  <!-- Replace plain classes with dark: prefix classes -->
  <div class="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white">
    <!-- Content -->
  </div>
</template>

<style scoped>
/* Use CSS variables for consistent styling */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>
```

## Common Component Updates

### Buttons
```vue
<!-- Light: bg-primary-600 text-white
     Dark: bg-primary-700 -->
<button class="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded hover:bg-primary-700 dark:hover:bg-primary-800">
  Click me
</button>
```

### Cards
```vue
<!-- Light: white background
     Dark: dark-900 background -->
<div class="bg-white dark:bg-neutral-900 rounded-lg p-4 shadow">
  <!-- Content -->
</div>
```

### Input Fields
```vue
<!-- Light: white/gray borders
     Dark: dark borders -->
<input 
  class="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded"
/>
```

### Text Sections
```vue
<!-- Primary text -->
<h1 class="text-gray-900 dark:text-white">Heading</h1>

<!-- Secondary text -->
<p class="text-gray-600 dark:text-gray-400">Description</p>

<!-- Tertiary text (subtle) -->
<span class="text-gray-500 dark:text-gray-500">Small text</span>
```

### Borders & Dividers
```vue
<!-- Light: light gray borders
     Dark: dark borders -->
<div class="border-b border-gray-200 dark:border-gray-700">
  <!-- Content -->
</div>
```

### Shadows
```vue
<div class="shadow dark:shadow-dark-card">
  <!-- Content -->
</div>
```

## Update Instructions by File

### LandingPage.vue
- [ ] Update hero section background: `bg-white dark:bg-neutral-900`
- [ ] Update card backgrounds: `bg-gray-50 dark:bg-neutral-800`
- [ ] Update text colors to use `dark:text-white`, `dark:text-gray-400`
- [ ] Update borders: `border-gray-200 dark:border-gray-700`
- [ ] Update button styles with dark variants

### BookingPage.vue
- [ ] Update form background: `bg-white dark:bg-neutral-900`
- [ ] Update input fields with dark styles
- [ ] Update label colors: `text-gray-700 dark:text-gray-300`
- [ ] Update placeholder text for dark mode
- [ ] Update button styles

### TrackPage.vue
- [ ] Update map container background
- [ ] Update info box styling
- [ ] Update tracking status indicators
- [ ] Update map markers if applicable

### ExpressPage.vue
- [ ] Update trip card backgrounds
- [ ] Update company info sections
- [ ] Update pricing displays
- [ ] Update filter/sort sections

### PaymentPage.vue
- [ ] Update payment method cards: `bg-gray-50 dark:bg-neutral-800`
- [ ] Update form fields
- [ ] Update security badges/indicators
- [ ] Update success/error messages

### AccountPage.vue
- [ ] Update profile card: `bg-white dark:bg-neutral-900`
- [ ] Update settings sections
- [ ] Update form fields
- [ ] Update user data displays

## Testing Checklist

After updating each page:
- [ ] Test in light mode (default)
- [ ] Toggle to dark mode
- [ ] Verify text contrast is sufficient (WCAG AA compliant)
- [ ] Check all buttons and interactive elements
- [ ] Verify images are visible in both modes
- [ ] Test on mobile (bottom nav toggle)
- [ ] Test on desktop (sidebar toggle)
- [ ] Check that transitions are smooth
- [ ] Verify localStorage saves preference

## Example: Complete Page Update

### Before:
```vue
<template>
  <div class="page">
    <div class="card">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
      <button @click="handleClick">Submit</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 16px;
  background: white;
}

.card {
  background: #F5F5F5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #E8E8E8;
}

h1 {
  color: #212121;
}

p {
  color: #757575;
}

button {
  background: #2E7D32;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
</style>
```

### After:
```vue
<template>
  <div class="page bg-white dark:bg-neutral-900 transition-colors">
    <div class="card bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700">
      <h1 class="text-gray-900 dark:text-white">{{ title }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ description }}</p>
      <button class="btn-primary bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white">Submit</button>
    </div>
  </div>
</template>

<style scoped>
.page {
  @apply p-4;
}

.card {
  @apply p-4 rounded-lg transition-colors;
}

button {
  @apply px-6 py-3 rounded transition-colors;
}
</style>
```

## Automatic Variables

These CSS variables automatically update when dark mode is toggled:

```css
--bg-primary       /* Changes between #FFFFFF and #121212 */
--bg-secondary     /* Changes between #F5F5F5 and #1E1E1E */
--bg-tertiary      /* Changes between #E8E8E8 and #2C2C2C */
--text-primary     /* Changes between #212121 and #E8E8E8 */
--text-secondary   /* Changes between #424242 and #B0B0B0 */
--text-tertiary    /* Changes between #757575 and #808080 */
--border-color     /* Changes between #E8E8E8 and #2C2C2C */
```

## Quick Reference: Dark Prefix Mapping

```
Light Color          → Dark Color
---------------------------
white                → gray-900
gray-50              → gray-900/neutral-900
gray-100             → gray-800/neutral-800
gray-200             → gray-700/neutral-700
gray-600             → gray-400/neutral-400
gray-700             → gray-300/neutral-300
gray-900             → white/gray-100
---------------------------

Use pattern: `class-name dark:dark-version`

Example:
bg-white dark:bg-neutral-900
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700
```
