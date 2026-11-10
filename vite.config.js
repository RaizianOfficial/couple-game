import { defineConfig } from 'vite';
import { setupRelay } from './src/firebase/localRelay.js';

export default defineConfig({
  plugins: [
    {
      name: 'local-rtdb-relay',
      configureServer(server) {
        setupRelay(server.middlewares);
      },
      configurePreviewServer(server) {
        setupRelay(server.middlewares);
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
