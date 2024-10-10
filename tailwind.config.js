/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      data: ['Space Mono', 'sans-serif'],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      cream: '#FEFAF3',
      flan: '#f4ecde',
      black: '#000000',
      disabled: '#C8CDD0',
      'gray-3': '#C8CDD0',
      'gray-2': '#828282',
      'gray-1': '#4f4f4f',
      'bright-blue': '#5E69FF',
      'dusty-rose': '#A06B87',
      info: '#2F80ED',
      success: '#27AE60',
      warning: '#F99A2A',
      error: '#EB5757',
      teal: '#55B1AB',
      divider: '#504D4D',
      overlay: 'rgba(57, 52, 52, 0.75)',
    },
    width: {
      modal: '480px',
      'single-block': '550px',
      dashboard: '1010px',
      full: '100%',
    },
    extend: {
      borderRadius: {
        'rounded-3xl': '20px',
        'rounded-md': '5px',
      },
      boxShadow: {
        md: '0px 4px 7px rgba(0,0,0,.25)',
        'blue-border': '8px 0 0 #5E69FF',
      },
      backgroundImage: {
        topRight: 'url(/assets/top-right-bars.png)',
      },
      fontSize: {
        xs: '10px',
        sm: '12px',
        base: '14px',
        lg: '20px',
        xl: '25px',
        '2xl': '30px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
