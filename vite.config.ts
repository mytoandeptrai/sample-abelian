import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PORT = 5173;

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: PORT,
      proxy: {
        '/abewalletmlp': {
          target: 'http://127.0.0.1:18665',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/abewalletmlp/, ''),
        },
      },
    },
    preview: {
      port: PORT,
    },
  };
});