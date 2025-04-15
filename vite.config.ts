// import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
      $routes: resolve(__dirname, 'src/routes'),
    },
  },
});
