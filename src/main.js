import { createApp } from 'vue'
import './style.css'
import 'leaflet/dist/leaflet.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { store } from './store/index.js'

// Pages
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

// Initialize user from localStorage
const initializeStore = () => {
  try {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      store.token = token
      store.user = JSON.parse(user)
    }
  } catch (err) {
    console.error('Error loading user from localStorage:', err)
  }
}

initializeStore()

const routes = [
    { path: '/', component: LandingPage },
    { path: '/login', component: AuthGatePage },
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
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
