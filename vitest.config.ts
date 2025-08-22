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
      $atoms: resolve(__dirname, 'src/components/atoms'),
      $features: resolve(__dirname, 'src/components/features'),
      $pages: resolve(__dirname, 'src/components/pages'),
      $routes: resolve(__dirname, 'src/routes'),
      '$app/stores': resolve(__dirname, 'test/__mocks__/stores'),
      '$app/navigation': resolve(__dirname, 'test/__mocks__/navigation'),
      'bits-ui': resolve(__dirname, 'node_modules/bits-ui/dist/index.js'),
      '@melt-ui/svelte': resolve(__dirname, 'node_modules/bits-ui/node_modules/@melt-ui/svelte/dist/index.js'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['test/e2e/setup-vitest.ts'],
    server: {
      deps: { inline: ['@sveltejs/kit'] },
    },
    globals: true,
    reporters: 'basic',
    coverage: {
      include: ['src/**'],
    },
    include: [
      'test/e2e/*.{test,spec}.?(c|m)[jt]s?(x)',
      'test/unit-and-integration/*.{test,spec}.?(c|m)[jt]s?(x)',
      'test/componentTests/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
  },
}));
