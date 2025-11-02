import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      css: {
        postcss: './postcss.config.js',
      },
      plugins: [
        react(),
        mode === 'analyze' && visualizer({
          filename: 'dist/bundle-analysis.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
      ].filter(Boolean),
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
        // Minify for production with Unicode support
        minify: 'esbuild',
        // Ensure proper charset handling
        assetsInlineLimit: 4096,
        // Configure ESBuild for better Unicode support
        esbuild: {
          charset: 'utf8',
          legalComments: 'none'
        }
      },
      // Add proper encoding support
      esbuild: {
        charset: 'utf8'
      }
    };
});
