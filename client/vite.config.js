import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Vite exposes only VITE_* variables by default.
    // The client reads import.meta.env.APP_API_URL, so allow the APP_ prefix too.
    envPrefix: ['VITE_', 'APP_'],
})
