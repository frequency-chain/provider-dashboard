import frequencyConfig from '@frequency-chain/style-guide/tailwind.config.ts';

/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        data: ['Space Mono', 'sans-serif'],
      },
      width: {
        modal: '480px',
        'single-block': '550px',
        dashboard: '1010px',
        full: '100%',
      },
      boxShadow: {
        'blue-border': '8px 0 0 #5E69FF',
      },
    },
  },
  presets: [frequencyConfig],
};
