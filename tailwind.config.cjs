const { tailwindExtractor } = require('tailwindcss/lib/lib/purgeUnusedStyles');

module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      display: ['Lexend', 'helvetica neue', 'Helvetica', 'sans-serif'],
      body: ['Lexend', 'sans-serif']
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
