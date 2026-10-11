import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  server: {
    fs: { allow: ['..'] },
  },
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
});
