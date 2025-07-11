import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $atoms: resolve(__dirname, 'src/components/atoms'),
      $features: resolve(__dirname, 'src/components/features'),
      $pages: resolve(__dirname, 'src/components/pages'),
      $routes: resolve(__dirname, 'src/routes'),
      'bits-ui': resolve(__dirname, 'node_modules/bits-ui/dist/index.js'),
      '@melt-ui/svelte': resolve(__dirname, 'node_modules/bits-ui/node_modules/@melt-ui/svelte/dist/index.js'),
    },
  },
});
