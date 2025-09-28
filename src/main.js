import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify imports
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const savedTheme = localStorage.getItem('theme') || 'dark';
const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: savedTheme,
        themes: {
            dark: {
                dark: true,
                colors: {
                    // Primary colors
                    primary: '#667eea',
                    secondary: '#764ba2',

                    // Background colors
                    background: '#0f172a',
                    surface: '#1e293b',
                    'surface-variant': 'rgba(30, 41, 59, 0.4)',

                    // Text colors
                    'on-surface': '#e2e8f0',
                    'on-surface-variant': '#cbd5e1',
                    'on-background': '#f8fafc'                }
            },
            light: {
                dark: false,
                colors: {
                    // Primary colors
                    primary: '#667eea',
                    secondary: '#764ba2',

                    // Background colors
                    background: '#ffffff',
                    surface: '#f8fafc',
                    'surface-variant': 'rgba(248, 250, 252, 0.8)',

                    // Text colors
                    'on-surface': '#1e293b',
                    'on-surface-variant': '#475569',
                    'on-background': '#0f172a'
                }
            }
        }
    }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')