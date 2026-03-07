<template>
  <div class="test-auth-page bg-white dark:bg-neutral-950 transition-colors">
    <div class="container">
      <div class="auth-box">
        <h1><i class="fas fa-flask"></i> Test Admin Dashboard</h1>
        <p>Select a role to log in with test credentials</p>

        <div class="roles-grid">
          <button
            v-for="role in roles"
            :key="role.value"
            @click="loginAsRole(role.value)"
            :class="['role-btn', { active: selectedRole === role.value }]"
          >
            <span class="role-emoji"><i :class="role.icon"></i></span>
            <span class="role-name">{{ role.label }}</span>
            <span class="role-desc">{{ role.description }}</span>
          </button>
        </div>

        <div v-if="selectedRole" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              disabled
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Any password (test mode)"
              class="form-input"
            />
          </div>

          <button @click="handleLogin" class="btn-login" :disabled="isLoading">
            <template v-if="isLoading">Logging in...</template>
            <template v-else><i class="fas fa-check-circle"></i> Login as {{ selectedRole }}</template>
          </button>

          <p class="warning">
            <i class="fas fa-exclamation-triangle"></i> Backend should be running: npm run dev in the /server folder
          </p>
        </div>

        <div class="available-roles">
          <h3>Available Test Roles:</h3>
          <ul>
            <li><i class="fas fa-bus"></i> <strong>Driver</strong> - Can view trip details and history</li>
            <li><i class="fas fa-user-tie"></i> <strong>Manager</strong> - Can manage drivers and trips</li>
            <li><i class="fas fa-building"></i> <strong>Express Admin</strong> - Can manage fleet and finance</li>
            <li><i class="fas fa-landmark"></i> <strong>RURA Admin</strong> - Can manage all expresses nationwide</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const selectedRole = ref(null)
const password = ref('test123')

const roles = [
  {
    value: 'Driver',
    label: 'Driver',
    icon: 'fas fa-bus',
    description: 'View trips & history',
    email: 'driver@test.com'
  },
  {
    value: 'Manager',
    label: 'Manager',
    icon: 'fas fa-user-tie',
    description: 'Manage drivers & trips',
    email: 'manager@test.com'
  },
  {
    value: 'Admin',
    label: 'Express Admin',
    icon: 'fas fa-building',
    description: 'Manage express company',
    email: 'admin@test.com'
  },
  {
    value: 'SuperAdmin',
    label: 'RURA Admin',
    icon: 'fas fa-landmark',
    description: 'National oversight',
    email: 'rura@test.com'
  }
]

const email = computed(() => {
  const role = roles.find(r => r.value === selectedRole.value)
  return role?.email || ''
})

function loginAsRole(role) {
  selectedRole.value = role
}

async function handleLogin() {
  if (!selectedRole.value) return

  isLoading.value = true

  try {
    // Call backend login endpoint
    const response = await fetch('http://localhost:5000/api/v1/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        role: selectedRole.value
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()

    // Store auth data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('userRole', data.role)

    // Redirect to appropriate dashboard
    const redirectMap = {
      Driver: '/driver',
      Manager: '/manager',
      Admin: '/admin',
      SuperAdmin: '/rura'
    }

    router.push(redirectMap[data.role] || '/')
  } catch (err) {
    console.error('Login error:', err)
    alert(`Login failed: ${err.message}\n\nMake sure:\n1. Backend is running (npm run dev in /server)\n2. Backend is on port 5000\n3. Check browser console for more details`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.test-auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
}

.auth-box {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.auth-box h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1a202c;
}

.auth-box > p {
  margin: 0 0 24px 0;
  color: #5a6c7d;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.role-btn {
  padding: 16px;
  border: 2px solid #e8ecf1;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.role-btn:hover {
  border-color: #667eea;
  background: #f5f6fa;
}

.role-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.role-emoji {
  font-size: 32px;
}

.role-name {
  font-weight: 600;
  font-size: 13px;
}

.role-desc {
  font-size: 11px;
  color: #5a6c7d;
}

.role-btn.active .role-desc {
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  background: #f5f6fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1a202c;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8ecf1;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-login:hover:not(:disabled) {
  background: #764ba2;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.warning {
  color: #f57c00;
  font-size: 12px;
  text-align: center;
  margin-top: 12px;
}

.available-roles {
  background: #fffbea;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 16px;
}

.available-roles h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #1a202c;
}

.available-roles ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.available-roles li {
  margin: 8px 0;
  font-size: 13px;
  color: #5a6c7d;
}

@media (max-width: 600px) {
  .auth-box {
    padding: 24px;
  }

  .roles-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
