/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.12), 0 10px 40px rgba(0,0,0,0.55)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}

