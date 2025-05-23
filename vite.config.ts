import path from 'path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['www.taskplanner.co.uk','taskplanner.co.uk'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'skip-eslint',
          buildStart() {
            this.warn('Skipping ESLint check');
          }
        }
      ]
    }
  }
});