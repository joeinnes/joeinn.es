const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md,mdx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Avenir Next',
					'Avenir',
					'Century Gothic',
					'Gill Sans',
					...defaultTheme.fontFamily.sans
				]
			},
			colors: {
				primary: {
					50: 'hsl(207, 73%, 97%)',
					100: 'hsl(207, 69%, 94%)',
					200: 'hsl(204, 66%, 86%)',
					300: 'hsl(204, 67%, 74%)',
					400: 'hsl(203, 66%, 60%)',
					500: 'hsl(202, 63%, 48%)',
					600: 'hsl(204, 69%, 39%)',
					700: 'hsl(205, 68%, 36%)',
					800: 'hsl(205, 64%, 27%)',
					900: 'hsl(207, 57%, 24%)',
					950: 'hsl(208, 56%, 16%)'
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
