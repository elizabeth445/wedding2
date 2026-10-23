import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  plugins: [
    react(),
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            filename: 'output/bundle.html',
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'gsap', test: /node_modules\/(?:gsap|@gsap\/react)\//, priority: 20 },
            { name: 'react', test: /node_modules\/(?:react|react-dom|scheduler)\//, priority: 10 },
          ],
        },
      },
    },
  },
});
