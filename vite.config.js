// Import Vite configuration function
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


// Import React plugin for Vite to handle JSX and React-specific features
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for the Nway Htway Web App
 * This configuration sets up the development server and build process
 * @see {@link https://vite.dev/config/} Vite configuration documentation
 */
export default defineConfig({
  // Plugins to enhance Vite's functionality
  plugins: [
    // React plugin to handle JSX, Fast Refresh, and other React-specific features
    react(),
    tailwindcss(),
  ],
})
