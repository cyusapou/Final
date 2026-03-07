---
description: Vue.js large-scale project development rules for On The Go Rwanda Bus Booking app
globs: **/*.{vue,js,ts,css}
alwaysApply: true
---

# AI ASSISTANT — VUE.JS LARGE-SCALE PROJECT GUIDE

Read and follow these rules on EVERY interaction with this codebase.

You are assisting a vibe coder who builds large-scale applications using
Vue.js (Vue 3 + Composition API). Your job is not just to make things work —
your job is to make sure the project stays clean, scalable, easy to debug,
and easy to extend over time.

Never cut corners silently. Never skip structure. Never leave a mess behind.

## PROJECT STRUCTURE

```
src/
├── assets/                 → Static files: images, fonts, global CSS
├── components/             → Reusable, dumb UI components only
│   └── ui/                 → Base-level atoms (Button, Input, Modal, etc.)
├── views/                  → Page-level components tied to routes
├── layouts/                → Wrapper layouts (DefaultLayout, AuthLayout)
├── composables/            → Reusable logic using Vue Composition API
├── stores/                 → Pinia stores, one file per domain
├── services/               → All API calls and external integrations
├── router/                 → Vue Router config and route guards
├── utils/                  → Pure helper functions (no Vue dependencies)
├── constants/              → App-wide constants and enums
├── types/                  → TypeScript types and interfaces (if using TS)
├── plugins/                → Vue plugin registrations
└── main.js                 → App entry point only — no logic here
```

- Views are never reused. Components are always reusable.
- Never put API calls directly inside a component or a view.
- Never put business logic inside a template or a computed property.
- If a file grows beyond 200 lines, split it.

## NAMING CONVENTIONS

- Components: PascalCase, at least two words (UserCard.vue, not Card.vue)
- Base UI: prefix with "Base" (BaseButton.vue, BaseModal.vue)
- Composables: start with "use" (useAuth.js, useCart.js)
- Stores (Pinia): start with "use", end with "Store" (useUserStore.js)
- Services: suffix with "Service" (authService.js, productService.js)
- Utils: name by function (formatDate.js, validateEmail.js)
- Variables/Functions: camelCase
- Booleans: prefix with is, has, can, should
- Event handlers: prefix with "handle" (handleSubmit, handleDelete)
- Constants: SCREAMING_SNAKE_CASE (MAX_RETRIES, API_BASE_URL)
- CSS classes: kebab-case, BEM when >3 rules

## COMPONENT RULES

1. Single responsibility — each component does ONE thing
2. Props down, events up — never mutate props directly
3. Always define props with types and defaults
4. Always define emits explicitly
5. Keep templates clean — no complex logic, use computed instead
6. Script setup order: imports → defineProps/defineEmits → stores → refs → computed → lifecycle → functions → watchers
7. Always use `<script setup>` with Composition API

## STATE MANAGEMENT

- All shared state in Pinia stores
- Every store exposes: data, isLoading, and error
- One store per domain: user, cart, products, orders, etc.
- Never modify store state directly from components — call actions
- Never put UI logic in stores

## DARK MODE

This project uses Tailwind CSS dark mode with class strategy (`darkMode: 'class'`).
The `html` element gets the `dark` class toggled.

- Always use CSS custom properties from style.css for colors
- Use `dark:` prefix for Tailwind dark mode classes
- Use CSS variables: --bg-primary, --bg-secondary, --text-primary, etc.
- Test BOTH light and dark mode for every component

## MOBILE RESPONSIVENESS

- Mobile-first approach (base styles = mobile)
- Breakpoint at 500px for desktop sidebar
- Bottom navigation on mobile, sidebar on desktop
- All touch targets minimum 44px
- Always test at 375px width (iPhone SE)
- Content padding: 16px mobile, 24px desktop
- Bottom padding 70px on mobile for nav bar

## ERROR HANDLING

- Every async action must have loading, success, and error states
- Never silence errors with empty catch blocks
- Show readable error messages to users
- Log errors with context prefix: `[ComponentName]`

## PERFORMANCE

- Use lazy loading for route components: `() => import('./views/Page.vue')`
- Always use `:key` with stable unique IDs in v-for
- Use `computed` over methods for cached results
- Debounce search inputs (min 300ms)
- Lazy load images: `<img loading="lazy" />`

## GIT CONVENTIONS

- Branch naming: feature/*, fix/*, refactor/*, chore/*
- Commit format: type(scope): description
- Never commit .env files, node_modules, or build output
