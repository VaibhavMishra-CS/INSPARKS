import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    server: {
      port: 5173
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          dashboard: resolve(__dirname, 'dashboard.html'),
          modules: resolve(__dirname, 'modules.html'),
          vocab: resolve(__dirname, 'vocab.html'),
          reading: resolve(__dirname, 'reading.html'),
          grammar: resolve(__dirname, 'grammar.html'),
          mocks: resolve(__dirname, 'mocks.html'),
          review: resolve(__dirname, 'review.html'),
          stats: resolve(__dirname, 'stats.html'),
          tracker: resolve(__dirname, 'tracker.html'),
        }
      }
    },
    define: {
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
      })
    }
  }
})