import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: preprocess({}),
  kit: {
    // this is an adapter for  statically-rendered, single page application.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // dependent on host platform, see GitHub pages doc, maybe?
      precompress: false,
      strict: true,
    }),
    paths: {
      base: dev ? '' : process.env.BASE_PATH,
    },
    alias: {
      $atoms: './src/components/atoms',
      '$atoms/*': './src/components/atoms/*',
      $features: './src/components/features',
      '$features/*': './src/components/features/*',
      $pages: './src/components/pages',
      '$pages/*': './src/components/pages/*',
      $lib: './src/lib',
      '$lib/*': './src/lib/*',
      $routes: './src/routes',
      '$routes/*': './src/routes/*',
    },
  },
};

export default config;
