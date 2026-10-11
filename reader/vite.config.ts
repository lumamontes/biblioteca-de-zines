import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  server: {
    fs: { allow: ['..'] },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
