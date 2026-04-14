import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shnayim Yomi brand palette
        // Navy / dark backgrounds
        parchment: {
          50:  '#f5f7fa',  // page background
          100: '#edf1f7',
          200: '#dce8f4',
          300: '#c1d9f1',  // borders, dividers
          400: '#9dbddf',
          500: '#7aa3ca',
          600: '#5a89b5',
        },
        // Dark navy text / headings
        ink: {
          600: '#41648d',  // medium navy-blue
          700: '#344358',  // dark blue-grey
          800: '#192434',  // near-dark navy
          900: '#162435',  // darkest navy
        },
        // Teal accent (primary interactive)
        sage: {
          50:  '#e8f4f4',
          100: '#d0eceb',
          200: '#a1d5d3',
          300: '#7fc5c4',
          400: '#5aa6a4',  // teal — primary action
          500: '#449cb6',  // darker teal
          600: '#3a89a0',
          700: '#2f7085',
          900: '#162435',
        },
      },
      fontFamily: {
        sans:    ['Poppins', 'Open Sans', 'system-ui', 'sans-serif'],
        display: ['Alike', 'Georgia', 'serif'],
        hebrew:  ['David Libre', 'Frank Ruehl CLM', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
