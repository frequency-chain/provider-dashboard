import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    svelte({ hot: !process.env.VITEST }),
  ],
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib'),
      $components: resolve(__dirname, 'src/components'),
      $routes: resolve(__dirname, 'src/routes'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
