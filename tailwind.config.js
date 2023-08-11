/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'cobalt': '#4B64FF',
      'scarlet': '#F82013',
      'white': '#ffffff',
      'silver': '#D3D3D3',
      'aqua': '#76CBCA'
    },
    extend: {
      borderRadius: {
        'rounded-3xl': '20px',
        'rounded-md': '5px',
      }
    },
  },
  plugins: [require('@tailwindcss/forms'),],
}

