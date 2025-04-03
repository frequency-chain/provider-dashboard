# Provider Dashboard

Dashboard for create and managing a provider account on Frequency.

Powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

[![Deploy to GitHub Pages](https://github.com/frequency-chain/provider-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/frequency-chain/provider-dashboard/actions/workflows/deploy.yml)

## Developing

```bash
npm
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of provider-dashboard:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target
> environment.

## Testing

To run the tests: The end to end tests require that a local instance of the frequency server is running. Clone the
frequency server repo from: https://github.com/frequency-chain/frequency and run the following command from the root of
the repo:

```bash
make start # starts the frequency node
```

Then if you don't have Playwright installed, install it:

```bash
npx playwright install --with-deps
```

Finally, run tests.

```bash
npm run test
npx playwright test
```
