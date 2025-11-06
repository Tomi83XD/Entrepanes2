import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // Actualiza automáticamente el service worker
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],  // Archivos a cachear (estáticos)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,  // Cachea llamadas a Firestore para offline
            handler: 'NetworkFirst',  // Intenta red primero, luego cache
            options: {
              cacheName: 'firebase-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,  // 1 año
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],  // Iconos adicionales (opcional)
      manifest: {
        name: 'Entrepanes - Catálogo de Sándwiches',
        short_name: 'Entrepanes',
        description: 'Los mejores sándwiches de Carlos Paz',
        theme_color: '#fbbf24',  // Color amarillo de tu tema
        background_color: '#fbbf24',
        display: 'standalone',  // Se ve como app nativa
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192x192.png',  // Icono generado por pwa-asset-generator
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',  // Icono generado por pwa-asset-generator
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',  // Versión maskable para iconos adaptables
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
