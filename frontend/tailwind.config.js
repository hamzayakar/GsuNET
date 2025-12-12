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
          DEFAULT: '#a90432',  // Galatasaray red
          dark: '#8a0329',
          light: '#c20541',
        },
        secondary: {
          DEFAULT: '#fbc02d',  // Galatasaray yellow
          dark: '#f9a825',
          light: '#fdd835',
        },
      },
    },
  },
  plugins: [],
}
