import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    baseURL: '/dashboard',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
