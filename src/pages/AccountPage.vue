<template>
  <div class="account-page">
    <div class="account-header">
      <button class="back-btn" @click="goBack">
        <i class="fas fa-arrow-left"></i>
      </button>
      <h1>{{ t.myAccount || 'My Account' }}</h1>
      <div class="spacer"></div>
    </div>

    <!-- User Profile Card -->
    <div class="profile-card">
      <div class="avatar-section">
        <div class="avatar-large">
          {{ userInitials }}
        </div>
      </div>

      <div class="user-info">
        <h2>{{ user.name }}</h2>
        <p class="email">{{ user.email }}</p>
        <p class="phone">{{ user.phone }}</p>
        <p class="member-since">
          {{ t.memberSince || 'Member since' }} {{ formatDate(user.createdAt) }}
        </p>
      </div>

      <button class="edit-profile-btn" @click="showEditModal = true">
        <i class="fas fa-edit"></i>
        {{ t.editProfile || 'Edit Profile' }}
      </button>
    </div>

    <!-- Wallet Section -->
    <div class="wallet-section">
      <h3>{{ t.myWallet || 'My Wallet' }}</h3>

      <div class="wallet-card">
        <div class="wallet-balance">
          <span class="label">{{ t.walletBalance || 'Wallet Balance' }}</span>
          <div class="balance-amount">
            RWF {{ formatBalance(user.walletBalance) }}
          </div>
        </div>

        <div class="wallet-actions">
          <button class="action-btn deposit-btn" @click="showDepositModal = true">
            <i class="fas fa-plus-circle"></i>
            {{ t.depositMoney || 'Deposit Money' }}
          </button>
          <button class="action-btn withdraw-btn" @click="showWithdrawModal = true">
            <i class="fas fa-minus-circle"></i>
            {{ t.withdrawMoney || 'Withdraw' }}
          </button>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="transactions-section">
        <h4>{{ t.recentTransactions || 'Recent Transactions' }}</h4>

        <div v-if="transactions.length > 0" class="transactions-list">
          <div v-for="tx in transactions" :key="tx.id" class="transaction-item">
            <div class="tx-icon" :class="tx.type">
              <i :class="tx.icon"></i>
            </div>
            <div class="tx-info">
              <p class="tx-description">{{ tx.description }}</p>
              <p class="tx-date">{{ formatDate(tx.date) }}</p>
            </div>
            <div class="tx-amount" :class="tx.type">
              {{ tx.type === 'deposit' ? '+' : '-' }} RWF {{ formatBalance(tx.amount) }}
            </div>
          </div>
        </div>

        <div v-else class="no-transactions">
          <i class="fas fa-inbox"></i>
          <p>{{ t.noTransactions || 'No transactions yet' }}</p>
        </div>
      </div>
    </div>

    <!-- Account Settings -->
    <div class="settings-section">
      <h3>{{ t.settings || 'Settings' }}</h3>

      <div class="settings-options">
        <button class="settings-option">
          <div class="option-icon">
            <i class="fas fa-bell"></i>
          </div>
          <div class="option-content">
            <p>{{ t.notifications || 'Notifications' }}</p>
            <span>{{ t.manageNotifications || 'Manage notification preferences' }}</span>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>

        <button class="settings-option" @click="showChangePasswordModal = true">
          <div class="option-icon">
            <i class="fas fa-lock"></i>
          </div>
          <div class="option-content">
            <p>{{ t.changePassword || 'Change Password' }}</p>
            <span>{{ t.updateSecuritySettings || 'Update your password' }}</span>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>

        <button class="settings-option">
          <div class="option-icon">
            <i class="fas fa-globe"></i>
          </div>
          <div class="option-content">
            <p>{{ t.language || 'Language' }}</p>
            <span>{{ t.currentLanguage || 'Choose your language' }}</span>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>

        <button class="settings-option logout-option" @click="handleLogout">
          <div class="option-icon">
            <i class="fas fa-sign-out-alt"></i>
          </div>
          <div class="option-content">
            <p>{{ t.logout || 'Logout' }}</p>
            <span>{{ t.signOutOfAccount || 'Sign out of your account' }}</span>
          </div>
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Deposit Modal -->
    <Teleport to="body">
      <div
        v-if="showDepositModal"
        class="modal-overlay"
        @click.self="showDepositModal = false"
      >
        <div class="modal-content deposit-modal">
          <div class="modal-header">
            <h2>{{ t.depositMoney || 'Deposit Money' }}</h2>
            <button class="close-btn" @click="showDepositModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="instruction">
              {{ t.selectDepositAmount || 'Select an amount to deposit' }}
            </p>

            <!-- Quick Amount Buttons -->
            <div class="quick-amounts">
              <button
                v-for="amount in [5000, 10000, 20000, 50000]"
                :key="amount"
                @click="depositForm.amount = amount"
                :class="{ active: depositForm.amount === amount }"
                class="amount-btn"
              >
                RWF {{ formatBalance(amount) }}
              </button>
            </div>

            <!-- Custom Amount -->
            <div class="custom-amount">
              <label>{{ t.customAmount || 'Custom Amount' }}</label>
              <div class="amount-input-wrapper">
                <span>RWF</span>
                <input
                  v-model.number="depositForm.amount"
                  type="number"
                  min="100"
                  required
                  :placeholder="t.enterAmount || 'Enter amount'"
                  class="amount-input"
                />
              </div>
            </div>

            <!-- Payment Method -->
            <div class="payment-method">
              <label>{{ t.paymentMethod || 'Payment Method' }}</label>
              <div class="methods">
                <button
                  @click="depositForm.method = 'momo'"
                  :class="{ active: depositForm.method === 'momo' }"
                  class="method-btn"
                >
                  <i class="fas fa-mobile-alt"></i>
                  MTN MoMo
                </button>
                <button
                  @click="depositForm.method = 'airtel'"
                  :class="{ active: depositForm.method === 'airtel' }"
                  class="method-btn"
                >
                  <i class="fas fa-mobile-alt"></i>
                  Airtel Money
                </button>
                <button
                  @click="depositForm.method = 'card'"
                  :class="{ active: depositForm.method === 'card' }"
                  class="method-btn"
                >
                  <i class="fas fa-credit-card"></i>
                  {{ t.card || 'Card' }}
                </button>
              </div>
            </div>

            <div v-if="depositError" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ depositError }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn-cancel"
              @click="showDepositModal = false"
              :disabled="isDepositLoading"
            >
              {{ t.cancel || 'Cancel' }}
            </button>
            <button
              class="btn-confirm"
              @click="processDeposit"
              :disabled="isDepositLoading || depositForm.amount < 100"
            >
              <span v-if="!isDepositLoading">
                {{ t.proceedToPayment || 'Proceed to Payment' }}
              </span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                {{ t.processing || 'Processing...' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Withdraw Modal -->
    <Teleport to="body">
      <div
        v-if="showWithdrawModal"
        class="modal-overlay"
        @click.self="showWithdrawModal = false"
      >
        <div class="modal-content withdraw-modal">
          <div class="modal-header">
            <h2>{{ t.withdrawMoney || 'Withdraw Money' }}</h2>
            <button class="close-btn" @click="showWithdrawModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="available-balance">
              <span>{{ t.availableBalance || 'Available Balance' }}</span>
              <p>RWF {{ formatBalance(user.walletBalance) }}</p>
            </div>

            <div class="form-group">
              <label>{{ t.withdrawAmount || 'Withdraw Amount' }}</label>
              <div class="amount-input-wrapper">
                <span>RWF</span>
                <input
                  v-model.number="withdrawForm.amount"
                  type="number"
                  min="100"
                  :max="user.walletBalance"
                  required
                  :placeholder="t.enterAmount || 'Enter amount'"
                  class="amount-input"
                />
              </div>
              <p class="helper-text">
                {{ t.minimumWithdrawal || 'Minimum withdrawal:' }} RWF 100
              </p>
            </div>

            <div class="form-group">
              <label>{{ t.bankAccount || 'Bank Account' }}</label>
              <select v-model="withdrawForm.bankAccount" class="form-input">
                <option value="">{{ t.selectBankAccount || 'Select bank account' }}</option>
                <option value="equity">Equity Bank - 1234567890</option>
                <option value="kigali">BK - 0987654321</option>
              </select>
            </div>

            <div v-if="withdrawError" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ withdrawError }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn-cancel"
              @click="showWithdrawModal = false"
              :disabled="isWithdrawLoading"
            >
              {{ t.cancel || 'Cancel' }}
            </button>
            <button
              class="btn-confirm"
              @click="processWithdraw"
              :disabled="isWithdrawLoading || !withdrawForm.amount || !withdrawForm.bankAccount"
            >
              <span v-if="!isWithdrawLoading">
                {{ t.withdraw || 'Withdraw' }}
              </span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Change Password Modal -->
    <Teleport to="body">
      <div
        v-if="showChangePasswordModal"
        class="modal-overlay"
        @click.self="showChangePasswordModal = false"
      >
        <div class="modal-content change-password-modal">
          <div class="modal-header">
            <h2>{{ t.changePassword || 'Change Password' }}</h2>
            <button class="close-btn" @click="showChangePasswordModal = false">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="instruction">
              {{ t.secureYourAccount || 'Secure your account with a strong password' }}
            </p>

            <div class="form-group">
              <label>{{ t.currentPassword || 'Current Password' }}</label>
              <input
                v-model="changePasswordForm.currentPassword"
                type="password"
                :placeholder="t.enterCurrentPassword || 'Enter current password'"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>{{ t.newPassword || 'New Password' }}</label>
              <input
                v-model="changePasswordForm.newPassword"
                type="password"
                :placeholder="t.enterNewPassword || 'Enter new password'"
                class="form-input"
              />
              <p class="helper-text">
                {{ t.passwordRequirements || 'Minimum 6 characters' }}
              </p>
            </div>

            <div class="form-group">
              <label>{{ t.confirmPassword || 'Confirm Password' }}</label>
              <input
                v-model="changePasswordForm.confirmPassword"
                type="password"
                :placeholder="t.confirmNewPassword || 'Confirm new password'"
                class="form-input"
              />
            </div>

            <div v-if="changePasswordError" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ changePasswordError }}
            </div>

            <div v-if="changePasswordSuccess" class="success-message">
              <i class="fas fa-check-circle"></i>
              {{ changePasswordSuccess }}
            </div>
          </div>

          <div class="modal-footer">
            <button
              class="btn-cancel"
              @click="showChangePasswordModal = false"
              :disabled="isChangePasswordLoading"
            >
              {{ t.cancel || 'Cancel' }}
            </button>
            <button
              class="btn-confirm"
              @click="handleChangePassword"
              :disabled="isChangePasswordLoading || !changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword"
            >
              <span v-if="!isChangePasswordLoading">
                {{ t.updatePassword || 'Update Password' }}
              </span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                {{ t.updating || 'Updating...' }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store/index.js'
import { translations } from '../translations/index.js'

const router = useRouter()

// Check authentication on mount
onMounted(() => {
  if (!store.user || !store.token) {
    router.push('/login')
  }
})

const currentLang = computed(() => store.currentLang)
const t = computed(() => translations[currentLang.value])
const user = computed(() => store.user)

const showDepositModal = ref(false)
const showWithdrawModal = ref(false)
const showEditModal = ref(false)
const showChangePasswordModal = ref(false)

const isDepositLoading = ref(false)
const isWithdrawLoading = ref(false)
const isChangePasswordLoading = ref(false)

const depositError = ref('')
const withdrawError = ref('')
const changePasswordError = ref('')
const changePasswordSuccess = ref('')

const depositForm = ref({
  amount: 5000,
  method: 'momo'
})

const withdrawForm = ref({
  amount: '',
  bankAccount: ''
})

const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const transactions = ref([
  {
    id: 1,
    type: 'deposit',
    description: 'Wallet Deposit',
    amount: 10000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: 'fas fa-plus-circle'
  },
  {
    id: 2,
    type: 'expense',
    description: 'Bus Ticket - Kigali to Butare',
    amount: 5000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    icon: 'fas fa-bus'
  },
  {
    id: 3,
    type: 'deposit',
    description: 'Wallet Deposit',
    amount: 20000,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    icon: 'fas fa-plus-circle'
  }
])

const userInitials = computed(() => {
  if (!user.value) return 'U'
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
})

const goBack = () => {
  router.replace('/home')
}

const formatBalance = (amount) => {
  return new Intl.NumberFormat('en-US').format(Math.floor(amount))
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(currentLang.value === 'ky' ? 'rw' : currentLang.value)
}

const processDeposit = async () => {
  depositError.value = ''
  isDepositLoading.value = true

  try {
    const token = store.token
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch('http://localhost:5000/api/auth/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'deposit',
        amount: depositForm.value.amount,
        description: `Deposit via ${depositForm.value.method.toUpperCase()}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Deposit failed')
    }

    // Add transaction
    transactions.value.unshift({
      id: Math.random(),
      type: 'deposit',
      description: `Deposit via ${depositForm.value.method.toUpperCase()}`,
      amount: depositForm.value.amount,
      date: new Date(),
      icon: 'fas fa-plus-circle'
    })

    // Update wallet balance in store
    store.user.walletBalance = data.walletBalance
    localStorage.setItem('user', JSON.stringify(store.user))

    // Reset form and close modal
    depositForm.value = { amount: 5000, method: 'momo' }
    showDepositModal.value = false
  } catch (err) {
    depositError.value = err.message || (t.value.depositFailed || 'Deposit failed')
  } finally {
    isDepositLoading.value = false
  }
}

const processWithdraw = async () => {
  withdrawError.value = ''
  isWithdrawLoading.value = true

  try {
    if (withdrawForm.value.amount > user.value.walletBalance) {
      throw new Error(t.value.insufficientBalance || 'Insufficient balance')
    }

    const token = store.token
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch('http://localhost:5000/api/auth/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'withdrawal',
        amount: withdrawForm.value.amount,
        description: `Withdrawal to ${withdrawForm.value.bankAccount}`,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Withdrawal failed')
    }

    // Add transaction
    transactions.value.unshift({
      id: Math.random(),
      type: 'withdrawal',
      description: `Withdrawal to ${withdrawForm.value.bankAccount}`,
      amount: withdrawForm.value.amount,
      date: new Date(),
      icon: 'fas fa-minus-circle'
    })

    // Update wallet balance in store
    store.user.walletBalance = data.walletBalance
    localStorage.setItem('user', JSON.stringify(store.user))

    // Reset form and close modal
    withdrawForm.value = { amount: '', bankAccount: '' }
    showWithdrawModal.value = false
  } catch (err) {
    withdrawError.value = err.message || (t.value.withdrawalFailed || 'Withdrawal failed')
  } finally {
    isWithdrawLoading.value = false
  }
}

const handleLogout = () => {
  store.user = null
  store.token = null
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/')
}

const handleChangePassword = async () => {
  changePasswordError.value = ''
  changePasswordSuccess.value = ''
  isChangePasswordLoading.value = true

  try {
    // Validate
    if (changePasswordForm.value.newPassword.length < 6) {
      throw new Error(t.value.passwordTooShort || 'Password must be at least 6 characters')
    }

    if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
      throw new Error(t.value.passwordMismatch || 'Passwords do not match')
    }

    // Get users database from localStorage
    const usersJson = localStorage.getItem('users_database')
    const users = usersJson ? JSON.parse(usersJson) : []

    // Find current user and verify current password
    const currentUser = users.find(u => u.email === user.value.email)
    if (!currentUser) {
      throw new Error(t.value.userNotFound || 'User not found')
    }

    if (currentUser.password !== changePasswordForm.value.currentPassword) {
      throw new Error(t.value.incorrectPassword || 'Current password is incorrect')
    }

    // Update password
    currentUser.password = changePasswordForm.value.newPassword
    localStorage.setItem('users_database', JSON.stringify(users))

    // Also update the user in store
    const updatedUser = { ...store.user }
    localStorage.setItem('user', JSON.stringify(updatedUser))

    changePasswordSuccess.value = t.value.passwordUpdated || 'Password updated successfully!'

    // Reset form
    changePasswordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }

    // Close modal after 2 seconds
    setTimeout(() => {
      showChangePasswordModal.value = false
      changePasswordSuccess.value = ''
    }, 2000)
  } catch (err) {
    changePasswordError.value = err.message
  } finally {
    isChangePasswordLoading.value = false
  }
}
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  background: var(--bg-primary, #F5F5F5);
  padding-bottom: 20px;
}

/* Header */
.account-header {
  background: var(--bg-secondary, #FFF);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-color, #EEE);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary, #F0F0F0);
  border: none;
  color: var(--text-primary, #333);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
}

.back-btn:active {
  transform: scale(0.95);
}

.account-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #333);
  flex: 1;
}

.spacer {
  width: 40px;
}

/* Profile Card */
.profile-card {
  background: var(--bg-secondary, #FFF);
  margin: 16px;
  padding: 24px 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar-section {
  margin-bottom: 16px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #2E7D32, #1B5E20);
  color: white;
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #333);
}

.user-info p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.member-since {
  font-size: 12px;
  color: var(--text-secondary, #999);
  margin-top: 8px;
}

.edit-profile-btn {
  width: 100%;
  margin-top: 16px;
  padding: 10px 16px;
  background: var(--primary-color, #2E7D32);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.edit-profile-btn:active {
  transform: scale(0.98);
}

/* Wallet Section */
.wallet-section {
  margin: 16px;
}

.wallet-section h3,
.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary, #333);
  padding: 0 8px;
}

.wallet-card {
  background: var(--bg-secondary, #FFF);
  padding: 20px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.wallet-balance {
  text-align: center;
  margin-bottom: 20px;
}

.wallet-balance .label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #666);
  margin-bottom: 6px;
}

.balance-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color, #2E7D32);
}

.wallet-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.action-btn {
  padding: 12px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.deposit-btn {
  background: #E8F5E9;
  color: #1B5E20;
}

.deposit-btn:active {
  background: #C8E6C9;
}

.withdraw-btn {
  background: #FCE4EC;
  color: #880E4F;
}

.withdraw-btn:active {
  background: #F8BBD0;
}

/* Transactions */
.transactions-section {
  margin-top: 16px;
}

.transactions-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-secondary, #FFF);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #EEE);
  gap: 12px;
}

.transaction-item:last-child {
  border-bottom: none;
}

.tx-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.tx-icon.deposit {
  background: #E8F5E9;
  color: #1B5E20;
}

.tx-icon.expense,
.tx-icon.withdrawal {
  background: #FCE4EC;
  color: #880E4F;
}

.tx-info {
  flex: 1;
}

.tx-description {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.tx-date {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.tx-amount {
  font-size: 13px;
  font-weight: 600;
}

.tx-amount.deposit {
  color: #1B5E20;
}

.tx-amount.expense,
.tx-amount.withdrawal {
  color: #880E4F;
}

.no-transactions {
  text-align: center;
  padding: 32px 16px;
  background: var(--bg-secondary, #FFF);
  border-radius: 12px;
  color: var(--text-secondary, #666);
}

.no-transactions i {
  font-size: 48px;
  color: var(--text-secondary, #CCC);
  margin-bottom: 12px;
  display: block;
}

.no-transactions p {
  margin: 0;
  font-size: 13px;
}

/* Settings */
.settings-section {
  margin: 16px;
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--bg-secondary, #FFF);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-option {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid var(--border-color, #EEE);
  background: none;
  cursor: pointer;
  color: var(--text-primary, #333);
  text-align: left;
  transition: background 0.2s;
  gap: 12px;
}

.settings-option:last-child {
  border-bottom: none;
}

.settings-option:active {
  background: var(--bg-tertiary, #F5F5F5);
}

.option-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-tertiary, #F5F5F5);
  font-size: 16px;
  flex-shrink: 0;
}

.settings-option.logout-option .option-icon {
  background: #FFEBEE;
  color: #D32F2F;
}

.option-content {
  flex: 1;
}

.option-content p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.option-content span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.settings-option > i {
  color: var(--text-secondary, #CCC);
  font-size: 14px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--bg-secondary, #FFF);
  width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  max-width: 500px;
  margin: 0 auto;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border-color, #EEE);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #333);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary, #F5F5F5);
  border-radius: 50%;
  color: var(--text-primary, #333);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.instruction {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: var(--text-secondary, #666);
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.amount-btn {
  padding: 12px;
  border: 2px solid var(--border-color, #EEE);
  border-radius: 8px;
  background: var(--bg-tertiary, #F5F5F5);
  color: var(--text-primary, #333);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.amount-btn.active {
  border-color: var(--primary-color, #2E7D32);
  background: rgba(46, 125, 50, 0.1);
  color: var(--primary-color, #2E7D32);
}

.custom-amount,
.payment-method,
.form-group {
  margin-bottom: 20px;
}

.custom-amount label,
.payment-method label,
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--border-color, #EEE);
  border-radius: 8px;
  background: var(--bg-tertiary, #F5F5F5);
}

.amount-input-wrapper span {
  color: var(--text-secondary, #999);
  font-weight: 600;
}

.amount-input,
.form-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 14px;
  color: var(--text-primary, #333);
}

.amount-input::placeholder,
.form-input::placeholder {
  color: var(--text-secondary, #999);
}

.amount-input:focus,
.form-input:focus {
  outline: none;
}

.helper-text {
  margin: 6px 0 0 0;
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.methods {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.method-btn {
  padding: 12px;
  border: 2px solid var(--border-color, #EEE);
  border-radius: 8px;
  background: var(--bg-tertiary, #F5F5F5);
  color: var(--text-primary, #333);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.method-btn.active {
  border-color: var(--primary-color, #2E7D32);
  background: rgba(46, 125, 50, 0.1);
  color: var(--primary-color, #2E7D32);
}

.method-btn i {
  font-size: 16px;
}

.available-balance {
  text-align: center;
  padding: 16px;
  background: var(--bg-tertiary, #F5F5F5);
  border-radius: 8px;
  margin-bottom: 20px;
}

.available-balance span {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.available-balance p {
  margin: 6px 0 0 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color, #2E7D32);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFEBEE;
  border-left: 3px solid #D32F2F;
  border-radius: 4px;
  color: #D32F2F;
  font-size: 12px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #E8F5E9;
  border-left: 3px solid #2E7D32;
  border-radius: 4px;
  color: #1B5E20;
  font-size: 12px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border-color, #EEE);
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary, #F5F5F5);
  color: var(--text-primary, #333);
}

.btn-cancel:active:not(:disabled) {
  background: var(--border-color, #EEE);
}

.btn-cancel:disabled {
  opacity: 0.5;
}

.btn-confirm {
  background: var(--primary-color, #2E7D32);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-confirm:active:not(:disabled) {
  background: #1B5E20;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile Responsive */
@media (max-width: 499px) {
  .account-header {
    padding: 12px 16px;
  }

  .profile-card {
    margin: 12px;
    padding: 20px 16px;
  }

  .wallet-actions {
    grid-template-columns: 1fr;
  }

  .methods {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 500px) {
  .account-page {
    max-width: 600px;
    margin: 0 auto;
  }

  .modal-overlay {
    align-items: center;
  }

  .modal-content {
    border-radius: 12px;
    max-height: 80vh;
  }
}
</style>
