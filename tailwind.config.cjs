const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: ['./src/**/*.{svelte,md}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'brand-yellow': {
          50: '#fefdf7',
          100: '#fefaee',
          200: '#fbf4d5',
          300: '#f9edbb',
          400: '#f5df89',
          500: '#F0D156',
          600: '#d8bc4d',
          700: '#b49d41',
          800: '#907d34',
          900: '#76662a'
        },
        'brand-green': {
          50: '#fcfefc',
          100: '#f9fdf9',
          200: '#f1faf0',
          300: '#e8f7e7',
          400: '#d6f1d5',
          500: '#C5EBC3',
          600: '#b1d4b0',
          700: '#94b092',
          800: '#768d75',
          900: '#617360'
        },
        brand: {
          50: '#f3f7fa',
          100: '#e7eff4',
          200: '#c2d8e4',
          300: '#9ec0d3',
          400: '#5591b2',
          500: '#0C6291',
          600: '#0b5883',
          700: '#094a6d',
          800: '#073b57',
          900: '#063047'
        },
        'brand-grey': {
          50: '#f5f6f5',
          100: '#ebecec',
          200: '#ced0ce',
          300: '#b1b3b1',
          400: '#767a77',
          500: '#3B413C',
          600: '#353b36',
          700: '#2c312d',
          800: '#232724',
          900: '#1d201d'
        },
        'brand-red': {
          50: '#fbf5f6',
          100: '#f6ebed',
          200: '#e9ccd1',
          300: '#dbaeb5',
          400: '#c1717e',
          500: '#A63446',
          600: '#952f3f',
          700: '#7d2735',
          800: '#641f2a',
          900: '#511922'
        },
        gray: {
          50: '#f3f7fa',
          100: '#e7eff4',
          200: '#c2d8e4',
          300: '#9ec0d3',
          400: '#5591b2',
          500: '#0C6291',
          600: '#0b5883',
          700: '#094a6d',
          800: '#073b57',
          900: '#063047'
        }
      },
      fontFamily: {
        header: ["'Lexend'", ...defaultTheme.fontFamily.serif]
      }
    },
    fontFamily: {
      sans: ['Lexend', ...defaultTheme.fontFamily.sans],
      serif: [...defaultTheme.fontFamily.serif],
      mono: [...defaultTheme.fontFamily.mono]
    }
  },
  variants: {
    extend: {}
  },
  plugins: [],
  mode: 'jit' // ⚠ Make sure to have this
};
