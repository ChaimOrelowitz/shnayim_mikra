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
        // Royal blue accent — replaces old sage green
        sage: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3b82f6',
          500: '#1d4ed8',  // royal blue — primary interactive
          600: '#1e40af',
          700: '#1e3a8a',
          900: '#0f1f4d',
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
