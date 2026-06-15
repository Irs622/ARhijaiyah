import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'public',         // index.html lives in /public
  publicDir: '../assets', // serve /assets at root

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },

  server: {
    port: 5173,
    host: true,  // expose on LAN — needed to test on a physical Android device
    https: true, // WebXR/camera APIs require HTTPS even on dev
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'es2020', // Android Chrome 80+ support
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html'),
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
