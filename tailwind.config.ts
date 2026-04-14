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
        parchment: {
          50:  '#fdfbf7',
          100: '#f9f5ed',
          200: '#f3ead9',
          300: '#e8d9bd',
          400: '#d9c49f',
          500: '#c9ae81',
          600: '#b89a63',
        },
        ink: {
          400: '#888888',
          500: '#666666',
          600: '#555555',
          700: '#3d3d3d',
          800: '#2a2a2a',
          900: '#1a1a1a',
        },
        sage: {
          50:  '#f2f7f2',
          100: '#e8f0e8',
          200: '#d1e1d1',
          300: '#a8c9a8',
          400: '#7eb17e',
          500: '#5a9a5a',
          600: '#4a8a4a',
          700: '#3a7a3a',
          900: '#1a3a1a',
        },
      },
      fontFamily: {
        sans:   ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        serif:  ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        hebrew: ['David Libre', 'Frank Ruehl CLM', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
