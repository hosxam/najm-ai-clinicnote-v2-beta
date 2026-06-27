import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/najm-ai-clinicnote-v2-beta/' : '/',
  plugins: [react(), tailwindcss()],
}))
