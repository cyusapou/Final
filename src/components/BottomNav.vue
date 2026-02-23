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
      <div :class="['nav-item', { active: isActive('/routine') }]" @click="goTo('/routine')">
        <i class="fas fa-bookmark"></i>
        <span>{{ t.routineTrips }}</span>
      </div>
      <div :class="['nav-item', { active: isActive('/planner') }]" @click="goTo('/planner')">
        <i class="fas fa-calendar-alt"></i>
        <span>{{ t.planner }}</span>
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
          <div class="sidebar-item">
            <i class="fas fa-map-marker-alt"></i>
            <span v-if="sidebarOpen">{{ t.track }}</span>
          </div>
          <div class="sidebar-item">
            <i class="fas fa-user"></i>
            <span v-if="sidebarOpen">{{ t.account }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-footer" v-if="sidebarOpen">
        <LanguageToggle />
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

const router = useRouter()
const route = useRoute()

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const sidebarOpen = computed(() => store.sidebarOpen)

const isActive = (path) => {
  return route.path === path
}

const goTo = (path) => {
  router.push(path)
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
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: none; /* hidden by default (mobile) */
  flex-direction: column;
  z-index: 200;
  transition: width 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
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
  border-bottom: 1px solid var(--border-color);
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
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.logo-text span {
  font-size: 10px;
  color: var(--text-tertiary);
}

.sidebar-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: #E8F5E9;
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
  color: var(--text-tertiary);
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
  color: var(--text-tertiary);
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
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: #E8F5E9;
  color: #2E7D32;
}

.sidebar.collapsed .sidebar-item {
  justify-content: center;
  padding: 12px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

/* Bottom Nav Styles (for mobile < 500px) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
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
  color: var(--text-tertiary);
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
</style>
