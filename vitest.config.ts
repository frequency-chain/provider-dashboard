import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Why do the alias not work in vite.config.ts?
export default defineConfig(({ mode }) => ({
  plugins: [
    svelte({
      compilerOptions: { hmr: !process.env.VITEST },
    }),
  ],
  resolve: {
    conditions: mode === 'test' ? ['browser'] : [],
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
      $routes: resolve(__dirname, 'src/routes'),
      '$app/stores': resolve(__dirname, 'test/__mocks__/stores'),
      '$app/navigation': resolve(__dirname, 'test/__mocks__/navigation'),
    },
  },
  test: {
    server: {
      deps: { inline: ['@sveltejs/kit'] },
    },
    environment: 'jsdom',
    globals: true,
    reporters: 'basic',
    coverage: {
      include: ['src/**'],
    },
    include: ['test/e2e/*.{test,spec}.?(c|m)[jt]s?(x)', 'test/unit-and-integration/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
}));
