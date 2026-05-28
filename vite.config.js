import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

function getApiPort() {
  try {
    const port = Number(fs.readFileSync('.dev-api-port', 'utf8').trim())
    if (port > 0) return port
  } catch {
    // file not created yet — API will write it on start
  }
  return Number(process.env.PORT) || 3001
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        router: () => `http://localhost:${getApiPort()}`,
      },
    },
  },
})
