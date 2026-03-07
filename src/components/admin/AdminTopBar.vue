<template>
  <header class="topbar">
    <div class="topbar-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="topbar-right">
      <div class="user-info">
        <div class="user-avatar">
          {{ userInitials }}
        </div>
        <div class="user-details">
          <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
          <p class="user-role">{{ roleLabel }}</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  user: Object,
  role: String
})

const route = useRoute()

const roleLabel = computed(() => {
  const roleMap = {
    Driver: 'Driver',
    Manager: 'Manager',
    Admin: 'Express Admin',
    SuperAdmin: 'RURA Admin',
  }
  return roleMap[props.role] || 'User'
})

const userInitials = computed(() => {
  if (props.user?.firstName && props.user?.lastName) {
    return `${props.user.firstName.charAt(0)}${props.user.lastName.charAt(0)}`.toUpperCase()
  }
  return 'U'
})

const pageTitle = computed(() => {
  const titleMap = {
    '/driver': 'Driver Dashboard',
    '/driver/trip': 'My Trip',
    '/driver/history': 'Trip History',
    '/driver/profile': 'My Profile',
    '/manager': 'Manager Dashboard',
    '/manager/drivers': 'Drivers',
    '/manager/trips': 'Live Trips',
    '/manager/schedule': 'Schedule',
    '/manager/reports': 'Reports',
    '/admin': 'Dashboard',
    '/admin/managers': 'Managers',
    '/admin/fleet': 'Fleet',
    '/admin/finance': 'Finance',
    '/admin/routes': 'Routes',
    '/admin/complaints': 'Complaints',
    '/rura': 'National Overview',
    '/rura/expresses': 'All Expresses',
    '/rura/compliance': 'Compliance',
    '/rura/feedback': 'Feedback',
    '/rura/analytics': 'Analytics',
    '/rura/announcements': 'Announcements',
    '/rura/users': 'Users',
  }
  return titleMap[route.path] || 'Dashboard'
})
</script>

<style scoped>
.topbar {
  background: #ffffff;
  border-bottom: 1px solid #e8ecf1;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.topbar-left {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f5f6fa;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a202c;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #5a6c7d;
}

@media (max-width: 600px) {
  .topbar {
    padding: 12px 16px;
  }

  .page-title {
    font-size: 16px;
  }

  .user-details {
    display: none;
  }
}
</style>
