<template>
  <div>
    <!-- Mobile Bottom Nav (< 500px) -->
    <nav class="bottom-nav mobile-nav">
      <div :class="['nav-item', { active: isActive('/') }]" @click="goTo('/')">
        <i class="fas fa-home"></i>
        <span>{{ t.home }}</span>
      </div>
      <div :class="['nav-item', { active: isActive('/express') }]" @click="goTo('/express')">
        <i class="fas fa-bus"></i>
        <span>{{ t.express }}</span>
      </div>
      <div :class="['nav-item', { active: isActive('/track') }]" @click="goTo('/track')">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ t.track }}</span>
      </div>
      <div :class="['nav-item', { active: isActive('/account') || isActive('/login') }]" @click="handleAccountClick">
        <i :class="isAuthenticated ? 'fas fa-user' : 'fas fa-sign-in-alt'"></i>
        <span>{{ isAuthenticated ? t.account : t.signIn }}</span>
      </div>
    </nav>

    <!-- Desktop Sidebar (>= 500px) -->
    <aside class="sidebar desktop-nav" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="sidebarOpen">
          <div class="logo-icon">
            <i class="fas fa-bus"></i>
          </div>
          <div class="logo-text">
            <h1>On The Go</h1>
            <span>Kigali, Rwanda</span>
          </div>
        </div>
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i :class="sidebarOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
        </button>
      </div>

      <div class="sidebar-content">
        <!-- Main Navigation -->
        <div class="nav-section">
          <div class="nav-section-title" v-if="sidebarOpen">{{ t.main }}</div>
          <div 
            :class="['sidebar-item', { active: isActive('/') }]" 
            @click="goTo('/')"
          >
            <i class="fas fa-home"></i>
            <span v-if="sidebarOpen">{{ t.home }}</span>
          </div>
          <div 
            :class="['sidebar-item', { active: isActive('/express') }]" 
            @click="goTo('/express')"
          >
            <i class="fas fa-bus"></i>
            <span v-if="sidebarOpen">{{ t.express }}</span>
          </div>
        </div>

        <!-- My Plans Section -->
        <div class="nav-section">
          <div class="nav-section-title" v-if="sidebarOpen">{{ t.myPlans }}</div>
          <div 
            :class="['sidebar-item', { active: isActive('/routine') }]" 
            @click="goTo('/routine')"
          >
            <i class="fas fa-bookmark"></i>
            <span v-if="sidebarOpen">{{ t.routineTrips }}</span>
          </div>
          <div 
            :class="['sidebar-item', { active: isActive('/planner') }]" 
            @click="goTo('/planner')"
          >
            <i class="fas fa-calendar-alt"></i>
            <span v-if="sidebarOpen">{{ t.planner }}</span>
          </div>
        </div>

        <!-- Other Section -->
        <div class="nav-section">
          <div class="nav-section-title" v-if="sidebarOpen">{{ t.other }}</div>
          <div 
            :class="['sidebar-item', { active: isActive('/track') }]" 
            @click="goTo('/track')"
          >
            <i class="fas fa-map-marker-alt"></i>
            <span v-if="sidebarOpen">{{ t.track }}</span>
          </div>
          <div 
            :class="['sidebar-item', { active: isActive('/account') || isActive('/login') }]" 
            @click="handleAccountClick"
          >
            <i :class="isAuthenticated ? 'fas fa-user' : 'fas fa-sign-in-alt'"></i>
            <span v-if="sidebarOpen">{{ isAuthenticated ? t.account : t.signIn }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-footer" v-if="sidebarOpen">
        <div class="footer-controls">
          <DarkModeToggle />
          <LanguageToggle />
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'
import LanguageToggle from './LanguageToggle.vue'
import DarkModeToggle from './DarkModeToggle.vue'

const router = useRouter()
const route = useRoute()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)
const isAuthenticated = computed(() => store.token && store.user)

const isActive = (path) => {
  return route.path === path
}

const goTo = (path) => {
  router.push(path)
}

const handleAccountClick = () => {
  if (isAuthenticated.value) {
    goTo('/account')
  } else {
    goTo('/login')
  }
}

const toggleSidebar = () => {
  store.sidebarOpen = !store.sidebarOpen
}
</script>

<style scoped>
/* Mobile Bottom Nav (< 500px) */
.mobile-nav {
  display: flex;
}

.desktop-nav {
  display: none;
}

/* Desktop Sidebar (>= 500px) */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 220px;
  background: white;
  border: 1px solid #22c55e;
  display: none; /* hidden by default (mobile) */
  flex-direction: column;
  z-index: 200;
  transition: width 0.3s ease, transform 0.3s ease;
}

@media (min-width: 500px) {
  .mobile-nav {
    display: none;
  }
  
  .desktop-nav {
    display: flex;
  }
  
  .sidebar {
    display: flex; /* show sidebar only on >= 500px */
  }
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #22c55e;
  min-height: 60px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: #2E7D32;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon i {
  color: #FFF;
  font-size: 16px;
}

.logo-text h1 {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.logo-text span {
  font-size: 10px;
  color: #6b7280;
}

.sidebar-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: #f3f4f6;
  color: #2E7D32;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 8px;
}

.sidebar-content {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 16px;
}

.nav-section-title {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px 4px;
  margin-bottom: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.sidebar-item i {
  font-size: 18px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-item span {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.sidebar-item.active {
  background: #dcfce7;
  color: #2E7D32;
}

.sidebar.collapsed .sidebar-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

/* Bottom Nav Styles (for mobile < 500px) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #6b7280;
  cursor: pointer;
  padding: 6px 8px;
  transition: all 0.2s;
  flex: 1;
  min-width: 0;
}

.nav-item.active {
  color: #2E7D32;
}

.nav-item i {
  font-size: 18px;
}

.nav-item span {
  font-size: 9px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Ensure bottom nav is only visible on small screens */
@media (max-width: 499px) {
  .bottom-nav {
    display: flex;
  }
}

@media (min-width: 500px) {
  .bottom-nav {
    display: none;
  }
}

/* Dark mode styles */
.dark .sidebar {
  background: #1f2937;
  border-color: #22c55e;
}

.dark .logo-text h1 {
  color: #f3f4f6;
}

.dark .logo-text span {
  color: #9ca3af;
}

.dark .sidebar-header {
  border-bottom-color: #22c55e;
}

.dark .sidebar-toggle {
  background: #374151;
  border-color: #4b5563;
  color: #9ca3af;
}

.dark .sidebar-toggle:hover {
  background: #4b5563;
  color: #2E7D32;
}

.dark .nav-section-title {
  color: #9ca3af;
}

.dark .sidebar-item {
  color: #9ca3af;
}

.dark .sidebar-item:hover {
  background: #374151;
  color: #f3f4f6;
}

.dark .sidebar-item.active {
  background: #1e3a28;
  color: #2E7D32;
}

.dark .sidebar-footer {
  border-top-color: #374151;
}

.dark .bottom-nav {
  background: #1f2937;
}

.dark .nav-item {
  color: #9ca3af;
}

.dark .nav-item.active {
  color: #2E7D32;
}
</style>
