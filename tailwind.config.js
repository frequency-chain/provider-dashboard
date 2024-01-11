/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      disabled: '#BCBAC0',
      'bg-black': '#232326',
      'bg-black-active': '#363639',
      blue: '#459ABA',
      'blue-light': '#69B9CD',
      green: '#6EE9D1',
      'green-success': '#7CFA4D',
      divider: '#504D4D',
      overlay: 'rgba(57, 52, 52, 0.75)',
    },
    width: {
      500: '500px',
    },
    extend: {
      borderRadius: {
        'rounded-3xl': '20px',
        'rounded-md': '5px',
      },
      boxShadow: {
        md: '0px 4px 7px rgba(0,0,0,.25)',
      },
      backgroundImage: {
        topRight: 'url(/assets/top-right-bars.png)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
