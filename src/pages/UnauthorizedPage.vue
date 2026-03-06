<template>
  <div class="unauthorized-page bg-white dark:bg-neutral-900 transition-colors">
    <div class="container">
      <div class="error-box">
        <div class="error-icon">🔒</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p class="error-detail">Your role: <strong>{{ userRole }}</strong></p>
        <button @click="goBack" class="btn-back">
          ← Go Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userRole = computed(() => localStorage.getItem('userRole') || 'Unknown')

function goBack() {
  router.push('/')
}
</script>

<style scoped>
.unauthorized-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  padding: 20px;
}

.error-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-box h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
  color: #1a202c;
}

.error-box p {
  margin: 8px 0;
  color: #5a6c7d;
  font-size: 16px;
}

.error-detail {
  background: #f5f6fa;
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0 !important;
}

.btn-back {
  margin-top: 24px;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #764ba2;
  transform: translateY(-2px);
}
</style>
