import { createRouter, createWebHashHistory } from 'vue-router'
import LandingPage from './views/LandingPage.vue'
import DashboardPage from './views/DashboardPage.vue'

const routes = [
    { path: '/', component: LandingPage, name: 'landing' },
    { path: '/dashboard', component: DashboardPage, name: 'dashboard' }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// Track route changes with Simple Analytics
router.afterEach((to) => {
    if (window.sa_pageview) {
        window.sa_pageview(to.name || to.path)
    }
})

export default router
