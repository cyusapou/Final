import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Pages
import LandingPage from './pages/LandingPage.vue'
import ExpressPage from './pages/ExpressPage.vue'
import TripsPage from './pages/TripsPage.vue'
import DestinationPage from './pages/DestinationPage.vue'
import SummaryPage from './pages/SummaryPage.vue'
import PaymentPage from './pages/PaymentPage.vue'
import RoutineTripsPage from './pages/RoutineTripsPage.vue'
import PlannerPage from './pages/PlannerPage.vue'

const routes = [
    { path: '/', component: LandingPage },
    { path: '/express', component: ExpressPage },
    { path: '/trips', component: TripsPage },
    { path: '/destination', component: DestinationPage },
    { path: '/summary', component: SummaryPage },
    { path: '/payment', component: PaymentPage },
    { path: '/routine', component: RoutineTripsPage },
    { path: '/planner', component: PlannerPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')
