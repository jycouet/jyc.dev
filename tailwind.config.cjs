/** @type {import('tailwindcss').Config}*/
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/layerchart/**/*.{svelte,js}'],

  theme: {
    extend: {
      colors: {
        'surface-100': 'oklch(var(--b1) / <alpha-value>)',
        'surface-200': 'oklch(var(--b2) / <alpha-value>)',
        'surface-300': 'oklch(var(--b3) / <alpha-value>)',
        'surface-content': 'oklch(var(--bc) / <alpha-value>)',
      },
    },
  },

  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: [
      {
        jyc: {
          ...require('daisyui/src/theming/themes')['sunset'],
          accent: '#4ca2fe',
        },
      },
    ],
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
}

module.exports = config
