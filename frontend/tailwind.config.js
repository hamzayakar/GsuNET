/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind v4: Colors defined in @theme directive in index.css
  // No need for theme.extend here anymore
}
