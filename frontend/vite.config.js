import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Ensure this is set correctly,
  
  resolve: {
    alias: {                                                      
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',        // MUST be 0.0.0.0, not 'localhost' or true
    port: 5173,
    strictPort: true,
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'host.docker.internal'], // Critical!
    cors: true,             // Enable CORS for all origins
    hmr: {
      host: 'localhost',    // HMR client connection
      port: 5173,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['localhost', '127.0.0.1'],
  }
})