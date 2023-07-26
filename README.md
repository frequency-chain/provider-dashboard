# provider-dashboard
Dashboard for Providers

Powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

## Developing
```bash
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

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Testing
To run the tests:
The end to end tests require that a local instance of the frequency server is running.
Clone the frequency server repo from:
https://github.com/LibertyDSNP/frequency
and run the following command from the root of the repo:
```bash
make start # starts the frequency node
Then run the tests:

npm run test
```
