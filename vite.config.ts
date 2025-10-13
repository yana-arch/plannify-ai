import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunk for React and related libraries
              vendor: ['react', 'react-dom'],
              // Markdown processing
              markdown: ['markdown-it'],
              // Document generation
              docx: ['docx'],
              // AI services
              ai: ['@google/genai']
            }
          }
        },
        chunkSizeWarningLimit: 600,
        // Enable source maps for better debugging
        sourcemap: false,
        // Minify for production
        minify: 'esbuild'
      }
    };
});
