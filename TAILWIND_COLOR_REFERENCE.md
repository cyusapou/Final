# Tailwind Dark Mode - Color System & Utilities

## 🎨 Complete Color Reference

### Primary Colors
```
Primary Green (Green Bus Theme)
Light: #2E7D32
Dark:  #2E7D32 (same - maintains brand identity)

Usage: Buttons, links, highlights
Tailwind: primary-* (configured in tailwind.config.js)
```

### Extended Color Palette
```
Tailwind Prefix: ✅ primary-50 through primary-900
                 ✅ accent-* (blue theme)
                 ✅ neutral-* (gray scale)
```

---

## 🌓 Light vs Dark Color Mapping

### Background Colors
```
Component          Light Color      Dark Color       Tailwind Utility
═══════════════════════════════════════════════════════════════════════
Primary BG         #FFFFFF          #121212          bg-white / dark:bg-neutral-900
Secondary BG       #F5F5F5          #1E1E1E          bg-gray-50 / dark:bg-neutral-800
Tertiary BG        #E8E8E8          #2C2C2C          bg-gray-100 / dark:bg-neutral-700
Card Background    #FFFFFF          #1E1E1E          bg-white / dark:bg-neutral-800  
Hover BG           #F5F5F5          #2C2C2C          bg-gray-50 / dark:bg-neutral-700
Active BG          #E8F5E9          #1B5E20          bg-primary-50 / dark:bg-primary-900
```

### Text Colors
```
Component          Light Color      Dark Color       Tailwind Utility
═══════════════════════════════════════════════════════════════════════
Primary Text       #212121          #E8E8E8          text-gray-900 / dark:text-white
Secondary Text     #424242          #B0B0B0          text-gray-600 / dark:text-gray-400
Tertiary Text      #757575          #808080          text-gray-500 / dark:text-gray-500
Placeholder        #9CA3AF          #6B7280          text-gray-400 / dark:text-gray-500
Disabled Text      #BDBDBD          #616161          text-gray-400 / dark:text-gray-600
Success Text       #2E7D32          #66BB6A          text-green-700 / dark:text-green-400
Error Text         #C62828          #EF5350          text-red-700 / dark:text-red-400
Warning Text       #F57F17          #FFB74D          text-amber-700 / dark:text-amber-400
```

### Border Colors
```
Component          Light Color      Dark Color       Tailwind Utility
═══════════════════════════════════════════════════════════════════════
Default Border     #E8E8E8          #2C2C2C          border-gray-200 / dark:border-gray-700
Input Border       #BDBDBD          #424242          border-gray-300 / dark:border-gray-600
Focus Border       #2E7D32          #4CAF50          border-primary-600 / dark:border-primary-400
Subtle Border      #F5F5F5          #1E1E1E          border-gray-100 / dark:border-gray-800
```

### Shadow Colors
```
Component          Light Shadow     Dark Shadow      Tailwind Utility
═══════════════════════════════════════════════════════════════════════
Card Shadow        rgba(0,0,0,0.1)  rgba(0,0,0,0.3)  shadow / dark:shadow-lg
Modal Shadow       rgba(0,0,0,0.3)  rgba(0,0,0,0.5)  shadow-2xl
Button Shadow      rgba(0,0,0,0.1)  rgba(0,0,0,0.2)  shadow-md / dark:shadow
```

---

## 🎯 Utility Class Reference

### Quick Copy-Paste Classes

#### Container Backgrounds
```html
<!-- Light background with dark mode support -->
<div class="bg-white dark:bg-neutral-900">
<div class="bg-gray-50 dark:bg-neutral-800">
<div class="bg-gray-100 dark:bg-neutral-700">
<div class="bg-gray-200 dark:bg-neutral-600">
```

#### Text Colors
```html
<!-- Primary text -->
<p class="text-gray-900 dark:text-white">

<!-- Secondary text -->
<p class="text-gray-600 dark:text-gray-400">

<!-- Tertiary text (subtle) -->
<p class="text-gray-500 dark:text-gray-500">

<!-- Error -->
<p class="text-red-600 dark:text-red-400">

<!-- Success -->
<p class="text-green-600 dark:text-green-400">
```

#### Borders & Dividers
```html
<!-- Default border -->
<div class="border border-gray-200 dark:border-gray-700">

<!-- Subtle border -->
<div class="border-b border-gray-100 dark:border-gray-800">

<!-- Focus border -->
<input class="border-2 border-primary-600 dark:border-primary-400">
```

#### Interactive Elements

**Buttons**
```html
<!-- Primary button -->
<button class="bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white">

<!-- Secondary button -->
<button class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white">

<!-- Outline button -->
<button class="border-2 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
```

**Input Fields**
```html
<!-- Text input -->
<input class="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500">

<!-- With focus state -->
<input class="focus:border-primary-600 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50">
```

**Select Dropdown**
```html
<select class="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
```

#### Cards & Panels
```html
<!-- Card with shadow -->
<div class="bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-md dark:shadow-md border border-gray-200 dark:border-gray-800">

<!-- Hover effect -->
<div class="bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">

<!-- Button card -->
<div class="bg-gray-50 dark:bg-neutral-800 p-4 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700">
```

#### Tables
```html
<!-- Table row -->
<tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-800">

<!-- Table cell -->
<td class="text-gray-900 dark:text-white p-4">

<!-- Table header -->
<th class="bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white font-semibold p-4">
```

---

## 🔧 Common Patterns

### Form Section
```vue
<div class="bg-white dark:bg-neutral-900 rounded-lg p-6">
  <h2 class="text-gray-900 dark:text-white text-lg font-bold mb-4">
    Section Title
  </h2>
  
  <div class="space-y-4">
    <div>
      <label class="block text-gray-700 dark:text-gray-300 font-medium mb-2">
        Field Label
      </label>
      <input 
        class="w-full bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-2"
      />
    </div>
  </div>
  
  <button class="mt-6 bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 text-white px-6 py-2 rounded">
    Submit
  </button>
</div>
```

### List Item
```vue
<div class="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
  <h3 class="text-gray-900 dark:text-white font-semibold">
    Item Title
  </h3>
  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
    Item description
  </p>
  <div class="flex justify-between items-center mt-3">
    <span class="text-primary-600 dark:text-primary-400 font-medium">
      Status
    </span>
    <button class="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
</div>
```

### Modal/Dialog
```vue
<div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center">
  <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl max-w-md w-full mx-4">
    <div class="border-b border-gray-200 dark:border-gray-700 p-6">
      <h2 class="text-gray-900 dark:text-white text-xl font-bold">
        Modal Title
      </h2>
    </div>
    
    <div class="p-6 text-gray-600 dark:text-gray-400">
      Modal content here
    </div>
    
    <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end gap-2">
      <button class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-50 dark:hover:bg-neutral-800">
        Cancel
      </button>
      <button class="px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded hover:bg-primary-700 dark:hover:bg-primary-800">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Alert/Toast
```vue
<!-- Success -->
<div class="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300 px-4 py-3 rounded">
  <p class="font-medium">Success message</p>
  <p class="text-sm mt-1">Additional details</p>
</div>

<!-- Error -->
<div class="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded">
  <p class="font-medium">Error message</p>
</div>

<!-- Warning -->
<div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300 px-4 py-3 rounded">
  <p class="font-medium">Warning message</p>
</div>
```

### Badge/Tag
```vue
<span class="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
  Badge
</span>

<span class="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm">
  Neutral
</span>
```

---

## 📱 Responsive with Dark Mode

```html
<!-- Stack on mobile, grid on desktop with dark support -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white dark:bg-neutral-900 p-4 rounded">
    <!-- Card content -->
  </div>
</div>

<!-- Hide on mobile, show on desktop with dark support -->
<div class="hidden md:block bg-gray-50 dark:bg-neutral-800 p-4">
  <!-- Desktop-only content -->
</div>
```

---

## ✨ Animation with Dark Mode

```html
<!-- Smooth transition between modes -->
<div class="transition-colors duration-300 dark:bg-neutral-900">

<!-- Longer transition for complex changes -->
<div class="transition-all duration-500 dark:bg-neutral-900 dark:text-white">

<!-- Multiple properties -->
<button class="transition-colors hover:bg-primary-700 dark:hover:bg-primary-800">
```

---

## 🧪 Testing Colors

### Light Mode Values (Default)
```
bg-white → #FFFFFF
text-gray-900 → #111827 (maps to #212121 via variables)
text-gray-600 → #4B5563 (maps to #424242 via variables)
border-gray-200 → #E5E7EB (maps to #E8E8E8 via variables)
```

### Dark Mode Values (Active with dark: prefix)
```
dark:bg-neutral-900 → #111827
dark:text-white → #FFFFFF
dark:text-gray-400 → #9CA3AF
dark:border-gray-700 → #374151
```

### Override With CSS Variables
```css
/* These automatically change on dark mode toggle */
background: var(--bg-primary);      /* #FFFFFF → #121212 */
color: var(--text-primary);         /* #212121 → #E8E8E8 */
border-color: var(--border-color);  /* #E8E8E8 → #2C2C2C */
```

---

## 🔍 Debugging Colors

Check computed styles in DevTools:
```javascript
// Get computed color value
getComputedStyle(element).backgroundColor

// Check if dark class is applied
document.documentElement.classList.contains('dark')

// Get CSS variable value
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
```

---

## 📋 Tailwind Dark Mode Limitations

1. ✅ Works with `class` strategy (configured in project)
2. ❌ Does NOT support media strategy in this setup
3. ✅ Requires explicit `dark:` prefix on utilities
4. ✅ Cascades correctly for nested elements
5. ✅ Works with generated Tailwind classes
6. ✅ Compatible with custom CSS variables

