# Dark Mode Implementation Guide

## Overview
This application now features a comprehensive dark mode system powered by Tailwind CSS with seamless light/dark theme switching.

## How It Works

### Architecture
- **Tailwind CSS Dark Mode**: Uses the `class` strategy for dark mode
- **Vue Reactive State**: Dark mode preference is stored in a reactive store
- **Local Storage**: User preference is persisted across sessions
- **HTML Class Binding**: The `dark` class is applied to the `<html>` element to enable Tailwind's dark mode

### User Interface
- **Desktop**: Dark mode toggle button in the sidebar footer (moon/sun icon)
- **Mobile**: Dark mode toggle in the bottom navigation bar
- **Auto-save**: Preference is automatically saved to browser's localStorage

## Using Dark Mode in Components

### Method 1: Tailwind's Dark Prefix
Use the `dark:` prefix for any Tailwind utility class:

```vue
<template>
  <div class="bg-white dark:bg-neutral-900">
    <h1 class="text-gray-900 dark:text-white">Hello</h1>
  </div>
</template>
```

### Method 2: CSS Variables
Use the existing CSS variables that automatically update in dark mode:

```vue
<template>
  <div :style="{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }">
    Content
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
</style>
```

### Method 3: CSS Dark Mode Selector
Use the `.dark-mode` class or CSS `:root.dark` selector:

```css
.my-component {
  background: white;
  color: #212121;
}

.my-component.dark-mode,
html.dark .my-component {
  background: #121212;
  color: #E8E8E8;
}
```

## Color Palette

### Light Mode
- **Background Primary**: `#FFFFFF` (white)
- **Background Secondary**: `#F5F5F5` (light gray)
- **Background Tertiary**: `#E8E8E8` (medium gray)
- **Text Primary**: `#212121` (dark gray-black)
- **Text Secondary**: `#424242` (medium gray)
- **Text Tertiary**: `#757575` (light gray)
- **Border**: `#E8E8E8` (light gray)
- **Primary Green**: `#2E7D32`

### Dark Mode
- **Background Primary**: `#121212` (very dark)
- **Background Secondary**: `#1E1E1E` (dark)
- **Background Tertiary**: `#2C2C2C` (medium dark)
- **Text Primary**: `#E8E8E8` (light gray-white)
- **Text Secondary**: `#B0B0B0` (medium light gray)
- **Text Tertiary**: `#808080` (medium gray)
- **Border**: `#2C2C2C` (medium dark)
- **Primary Green**: `#2E7D32` (same as light mode)

## CSS Variables Reference

```
Light Mode               Dark Mode
================         ================
--bg-primary             #121212
--bg-secondary           #1E1E1E
--bg-tertiary            #2C2C2C
--text-primary           #E8E8E8
--text-secondary         #B0B0B0
--text-tertiary          #808080
--border-color           #2C2C2C
--primary-green          #2E7D32 (same)
```

## Tailwind Color Utilities

The application extends Tailwind's color palette with custom dark-aware colors:

```vue
<!-- Using Tailwind's dark: prefix -->
<div class="bg-primary-50 dark:bg-neutral-900">
  <span class="text-primary-900 dark:text-primary-50">Content</span>
</div>
```

## Toggling Dark Mode Programmatically

```vue
<script setup>
import { store } from '@/store/index.js'

// Toggle dark mode
const toggleDarkMode = () => {
  store.toggleDarkMode()
  // This will:
  // 1. Toggle the darkMode boolean in store
  // 2. Add/remove 'dark' class from html element
  // 3. Update localStorage automatically
}
</script>
```

## Best Practices

1. **Always use Tailwind's dark: prefix** when possible for consistency
2. **For complex components**, combine CSS variables with dark prefix classes
3. **Test both modes** during component development
4. **Use sufficient color contrast** for WCAG accessibility compliance
5. **Avoid hardcoded colors** - always use variables or Tailwind utilities
6. **Consider transitions** - add transition classes for smooth theme switching

## Example Component with Dark Mode

```vue
<template>
  <div class="bg-white dark:bg-neutral-900 transition-colors duration-300">
    <div class="p-4">
      <h1 class="text-gray-900 dark:text-white text-2xl font-bold">
        {{ title }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ description }}
      </p>
    </div>
    <div class="border-t border-gray-200 dark:border-gray-700 p-4">
      <button class="bg-primary-600 dark:bg-primary-700 text-white px-4 py-2 rounded">
        Action
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>

<style scoped>
/* Optional: Explicit dark mode styles */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>
```

## Files Modified for Dark Mode

1. **tailwind.config.js** - Tailwind configuration with dark mode support
2. **postcss.config.js** - PostCSS configuration for Tailwind
3. **src/style.css** - Global styles with dark mode directives
4. **src/App.vue** - Dark mode class application to html element
5. **src/store/index.js** - Dark mode state and toggle function
6. **src/components/BottomNav.vue** - Dark mode toggle button
7. **src/components/DarkModeToggle.vue** - Dark mode toggle component

## Troubleshooting

### Dark mode not applying?
1. Verify `dark` class is on the `<html>` element
2. Check that Tailwind CSS is properly bundled
3. Clear browser cache and localStorage
4. Verify `darkMode: 'class'` is set in tailwind.config.js

### CSS variables not updating?
1. Ensure `:root.dark-mode` or `html.dark` rules are defined in style.css
2. Check variable names are consistent
3. Verify browser DevTools shows the correct CSS variable values

### Toggle not working?
1. Check store.toggleDarkMode() is being called
2. Verify localStorage write is not blocked
3. Check console for JavaScript errors

## Future Enhancements

- [ ] System preference detection (prefers-color-scheme media query)
- [ ] Scheduled dark mode (e.g., sunset to sunrise)
- [ ] Multiple theme options (not just light/dark)
- [ ] Theme customization panel for users
- [ ] Animation preferences respect

