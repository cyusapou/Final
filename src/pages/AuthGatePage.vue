<template>
  <div class="auth-gate">
    <!-- Background Animation -->
    <div class="auth-background">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <!-- Auth Container -->
    <div class="auth-container">
      <!-- Logo Section -->
      <div class="logo-section">
        <div class="logo-icon">
          <i class="fas fa-bus"></i>
        </div>
        <h1>{{ t.appName || 'On The Go' }}</h1>
        <p>{{ t.tagline || 'Your Smart Bus Booking Platform' }}</p>
      </div>

      <!-- Auth Content -->
      <div class="auth-content">
        <!-- Sign In Form -->
        <div v-if="!showSignUp" class="auth-form-wrapper">
          <h2>{{ t.signIn || 'Sign In' }}</h2>
          <p>{{ t.welcomeBack || 'Welcome back! Sign in to your account' }}</p>

          <form @submit.prevent="handleSignIn" class="form">
            <div class="form-group">
              <label>{{ t.email || 'Email Address' }}</label>
              <input
                v-model="signInForm.email"
                type="email"
                required
                :placeholder="t.enterEmail || 'Enter your email'"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>{{ t.password || 'Password' }}</label>
              <div class="password-wrapper">
                <input
                  v-model="signInForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :placeholder="t.enterPassword || 'Enter your password'"
                  class="form-input"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ error }}
            </div>

            <button type="submit" :disabled="isLoading || !signInForm.email || !signInForm.password" class="submit-btn">
              <span v-if="!isLoading">{{ t.signIn || 'Sign In' }}</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                {{ t.signingIn || 'Signing In...' }}
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>
              {{ t.noAccount || "Don't have an account?" }}
              <button type="button" class="link-btn" @click="showSignUp = true">
                {{ t.createOne || 'Create one' }}
              </button>
            </p>
          </div>
        </div>

        <!-- Sign Up Form -->
        <div v-else class="auth-form-wrapper">
          <h2>{{ t.signUp || 'Sign Up' }}</h2>
          <p>{{ t.createAccount || 'Create a new account' }}</p>

          <form @submit.prevent="handleSignUp" class="form">
            <div class="form-group">
              <label>{{ t.fullName || 'Full Name' }}</label>
              <input
                v-model="signUpForm.fullName"
                type="text"
                required
                :placeholder="t.enterFullName || 'Enter your full name'"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>{{ t.email || 'Email Address' }}</label>
              <input
                v-model="signUpForm.email"
                type="email"
                required
                :placeholder="t.enterEmail || 'Enter your email'"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>{{ t.phoneNumber || 'Phone Number' }}</label>
              <input
                v-model="signUpForm.phone"
                type="tel"
                :placeholder="t.enterPhone || 'Enter your phone'"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>{{ t.password || 'Password' }}</label>
              <div class="password-wrapper">
                <input
                  v-model="signUpForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  :placeholder="t.enterPassword || 'Enter password'"
                  class="form-input"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-checkbox">
              <input
                id="terms"
                v-model="signUpForm.agreeTerms"
                type="checkbox"
                required
                class="checkbox-input"
              />
              <label for="terms">
                {{ t.agreeToTerms || 'I agree to the Terms and Conditions' }}
              </label>
            </div>

            <div v-if="error" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ error }}
            </div>

            <button type="submit" :disabled="isLoading || !isSignUpFormValid" class="submit-btn">
              <span v-if="!isLoading">{{ t.signUp || 'Sign Up' }}</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                {{ t.signingUp || 'Creating Account...' }}
              </span>
            </button>
          </form>

          <div class="auth-footer">
            <p>
              {{ t.alreadyHaveAccount || 'Already have an account?' }}
              <button type="button" class="link-btn" @click="showSignUp = false">
                {{ t.signIn || 'Sign In' }}
              </button>
            </p>
          </div>
        </div>
      </div>

      <!-- Feature Highlights -->
      <div class="features">
        <div class="feature">
          <i class="fas fa-bus"></i>
          <span>{{ t.easyBooking || 'Easy Booking' }}</span>
        </div>
        <div class="feature">
          <i class="fas fa-map-marker-alt"></i>
          <span>{{ t.trackTrips || 'Track Trips' }}</span>
        </div>
        <div class="feature">
          <i class="fas fa-credit-card"></i>
          <span>{{ t.securePay || 'Secure Payment' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'

const router = useRouter()
const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])

// ===== Local User Database Helpers =====
const getUsersDatabase = () => {
  try {
    const users = localStorage.getItem('usersDatabase')
    return users ? JSON.parse(users) : {}
  } catch {
    return {}
  }
}

const saveUserToDatabase = (email, userData) => {
  const users = getUsersDatabase()
  users[email] = userData
  localStorage.setItem('usersDatabase', JSON.stringify(users))
}

const getUserFromDatabase = (email) => {
  const users = getUsersDatabase()
  return users[email] || null
}

const showSignUp = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const signInForm = ref({
  email: '',
  password: ''
})

const signUpForm = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  agreeTerms: false
})

// ===== Form Validation =====
const isSignUpFormValid = computed(() => {
  return (
    signUpForm.value.fullName.trim() !== '' &&
    signUpForm.value.email.trim() !== '' &&
    signUpForm.value.phone.trim() !== '' &&
    signUpForm.value.password.trim() !== '' &&
    signUpForm.value.agreeTerms
  )
})

const handleSignIn = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const email = signInForm.value.email.trim()
    const password = signInForm.value.password

    // Check if user exists in local database
    const userRecord = getUserFromDatabase(email)

    if (!userRecord) {
      throw new Error('Oops! No account found with this email. Please sign up first.')
    }

    // Validate password
    if (userRecord.password !== password) {
      throw new Error('Oops! Incorrect password. Please try again.')
    }

    // Login successful - save to store and localStorage
    const userData = {
      name: userRecord.name,
      email: userRecord.email,
      phone: userRecord.phone || '',
      createdAt: userRecord.createdAt,
      walletBalance: userRecord.walletBalance || 0
    }

    store.user = userData
    store.token = 'local-token-' + Date.now()
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', store.token)

    // Reset form
    signInForm.value = { email: '', password: '' }

    // Navigate to home page
    router.replace('/home')
  } catch (err) {
    error.value = err.message || 'Sign in failed'
  } finally {
    isLoading.value = false
  }
}

const handleSignUp = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const email = signUpForm.value.email.trim()
    const fullName = signUpForm.value.fullName.trim()
    const password = signUpForm.value.password
    const phone = signUpForm.value.phone.trim()

    // Validate inputs
    if (!email || !fullName || !password || !phone) {
      throw new Error('Please fill in all required fields')
    }

    // Check if email already exists
    const existingUser = getUserFromDatabase(email)
    if (existingUser) {
      throw new Error('Oops! An account with this email already exists. Please sign in instead.')
    }

    // Create new user and save to local database
    const newUserData = {
      name: fullName,
      email: email,
      phone: phone,
      password: password,
      createdAt: new Date().toISOString(),
      walletBalance: 0
    }

    saveUserToDatabase(email, newUserData)

    // Log the user in immediately after sign up
    const userData = {
      name: newUserData.name,
      email: newUserData.email,
      phone: newUserData.phone,
      createdAt: newUserData.createdAt,
      walletBalance: newUserData.walletBalance
    }

    store.user = userData
    store.token = 'local-token-' + Date.now()
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', store.token)

    // Reset form
    signUpForm.value = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      agreeTerms: false
    }

    // Navigate to home page
    router.replace('/home')
  } catch (err) {
    error.value = err.message || 'Sign up failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-gate {
  min-height: 100vh;
  background: var(--bg-primary, #F5F5F5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

/* Background Animation */
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  z-index: 0;
}

.bg-shape {
  position: absolute;
  opacity: 0.5;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  bottom: 50px;
  right: 50px;
  animation-delay: 1s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: 20%;
  left: 10%;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(20px);
  }
}

/* Auth Container */
.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-section h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.logo-section p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* Auth Content */
.auth-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  margin-bottom: 24px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-form-wrapper h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1B5E20;
}

.auth-form-wrapper p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 12px 14px;
  border: 1px solid #DDD;
  border-radius: 6px;
  background: #F9F9F9;
  color: #333;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2E7D32;
  background: white;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
}

.form-input::placeholder {
  color: #AAA;
}

/* Password Wrapper */
.password-wrapper {
  position: relative;
  display: flex;
}

.password-wrapper .form-input {
  flex: 1;
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #2E7D32;
}

/* Checkbox */
.form-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: #2E7D32;
}

.form-checkbox label {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  cursor: pointer;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #FFEBEE;
  border-left: 3px solid #D32F2F;
  border-radius: 4px;
  color: #D32F2F;
  font-size: 13px;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #1B5E20, #0E3818);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  border-top: 1px solid #EEE;
  padding-top: 16px;
}

.auth-footer p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.link-btn {
  background: none;
  border: none;
  color: #2E7D32;
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  transition: opacity 0.2s;
  padding: 0;
  display: inline;
}

.link-btn:hover {
  opacity: 0.7;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.feature {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 16px 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.feature:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px);
}

.feature i {
  font-size: 24px;
}

/* Mobile Responsive */
@media (max-width: 499px) {
  .auth-container {
    max-width: 100%;
  }

  .auth-content {
    padding: 24px;
  }

  .logo-section {
    margin-bottom: 32px;
  }

  .logo-icon {
    font-size: 48px;
  }

  .logo-section h1 {
    font-size: 24px;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
