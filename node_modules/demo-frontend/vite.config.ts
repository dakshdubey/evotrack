import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ['@evotrack/client']
    },
    build: {
        commonjsOptions: {
            include: [/packages\/client-sdk/, /node_modules/]
        }
    },
    server: {
        port: 5173
    }
})
