import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryName = 'Intelligent-Poaching-Detection-and-Response-System'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' && process.env.GITHUB_ACTIONS === 'true'
    ? `/${repositoryName}/`
    : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
}))
