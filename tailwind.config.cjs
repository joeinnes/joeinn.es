const { tailwindExtractor } = require("tailwindcss/lib/lib/purgeUnusedStyles");

module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
    fontFamily: {
      display: ["Lato", "helvetica neue", "Helvetica", "sans-serif"],
      body: ["work sans", "sans-serif"],
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
