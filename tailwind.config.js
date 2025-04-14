// import frequencyConfig from '@frequency-chain/style-guide/tailwind.config';

/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      data: ['Space Mono', 'sans-serif'],
    },
    width: {
      modal: '480px',
      'single-block': '550px',
      dashboard: '1010px',
      full: '100%',
    },
    extend: {
      boxShadow: {
        'blue-border': '8px 0 0 #5E69FF',
      },
      backgroundImage: {
        topRight: 'url(/assets/top-right-bars.png)',
      },
    },
  },
  presets: [],
};
