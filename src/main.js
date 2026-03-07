import { createApp } from 'vue'
import './style.css'
import 'leaflet/dist/leaflet.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { store } from './store/index.js'

// Customer Pages
import AuthGatePage from './pages/AuthGatePage.vue'
import LandingPage from './pages/LandingPage.vue'
import ExpressPage from './pages/ExpressPage.vue'
import TripsPage from './pages/TripsPage.vue'
import DestinationPage from './pages/DestinationPage.vue'
import SummaryPage from './pages/SummaryPage.vue'
import PaymentPage from './pages/PaymentPage.vue'
import RoutineTripsPage from './pages/RoutineTripsPage.vue'
import PlannerPage from './pages/PlannerPage.vue'
import TrackPage from './pages/TrackPage.vue'
import AccountPage from './pages/AccountPage.vue'
import BookingPage from './pages/BookingPage.vue'
import RecentBookingsPage from './pages/RecentBookingsPage.vue'
import UnauthorizedPage from './pages/UnauthorizedPage.vue'
import TestAuthPage from './pages/TestAuthPage.vue'

const initializeStore = () => {
  try {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')
    if (token && user) {
      store.token = token
      store.user = JSON.parse(user)
      store.userRole = userRole
    }
  } catch (err) {
    console.error('Error loading user from localStorage:', err)
  }
}
initializeStore()

const routes = [
  // ─── CUSTOMER ────────────────────────
  { path: '/', component: LandingPage },
  { path: '/login', component: AuthGatePage },
  { path: '/auth', component: AuthGatePage },
  { path: '/test-login', component: TestAuthPage },
  { path: '/home', component: LandingPage },
  { path: '/express', component: ExpressPage },
  { path: '/trips', component: TripsPage },
  { path: '/destination', component: DestinationPage },
  { path: '/summary', component: SummaryPage },
  { path: '/payment', component: PaymentPage },
  { path: '/routine', component: RoutineTripsPage },
  { path: '/planner', component: PlannerPage },
  { path: '/track', component: TrackPage },
  { path: '/account', component: AccountPage },
  { path: '/booking', component: BookingPage },
  { path: '/recent-bookings', component: RecentBookingsPage },
  { path: '/bookings/:id', component: () => import('./pages/BookingDetailPage.vue') },
  { path: '/unauthorized', component: UnauthorizedPage },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Role guard — disabled for development, all pages accessible directly
router.beforeEach(() => true)

createApp(App).use(router).mount('#app')
