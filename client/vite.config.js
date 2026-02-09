import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  server: {
    https: true,
    host: true, // Expose to network
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5004',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'NetDrop',
        short_name: 'NetDrop',
        description: 'Secure File Transfer & Text Sharing - No Signup',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-socket': ['socket.io-client'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  },
})
