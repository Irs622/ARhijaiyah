import { defineConfig } from 'vite';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl()
  ],
  // root defaults to project directory — index.html lives here
  publicDir: 'public', // static files (manifest.json, assets/) served at /

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },

  server: {
    port: 5173,
    host: true,   // expose on LAN
    https: true,  // Use basicSsl for HTTPS on LAN
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020', // Android Chrome 80+ support
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          'three':  ['three'],
          'mindar': ['mind-ar'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['three', 'mind-ar'],
    // MindAR ships pre-bundled WASM — exclude from Vite's transform
    exclude: ['mind-ar/dist/mindar-image-three.prod.js'],
  },

  worker: {
    format: 'es',
  },
});
