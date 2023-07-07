import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

// TODO: set up deployment to GitHub pages. See https://kit.svelte.dev/docs/adapter-static#github-pages

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// this is an adapter for  statically-rendered, single page application.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '200.html', // dependent on host platform, see GitHub pages doc, maybe?
			precompress: false,
			strict: true,
		}),
		paths: {
			base: dev ? '' : process.env.BASE_PATH,
		}
	}
};

export default config;
