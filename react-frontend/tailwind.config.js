/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C5A880',
          dark: '#A3845B',
          light: '#E2CEB1'
        },
        background: '#0B0B0C',
        surface: {
          DEFAULT: '#121214',
          variant: '#1D2022',
          card: '#121214'
        },
        'on-surface': {
          DEFAULT: '#E1E2E4',
          variant: '#919094'
        },
        outline: '#46464A'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        headline: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
