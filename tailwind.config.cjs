/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {},
  },

  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        jyc: {
          ...require("daisyui/src/theming/themes")["sunset"],
        },
      },
    ],
    logs: false, // Shows info about daisyUI version and used config in the console when building your CSS
  },
};

module.exports = config;
