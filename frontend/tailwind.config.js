/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0c66e4',
          600: '#0052cc',
          700: '#0747a6',
          900: '#091e42',
        }
      }
    },
  },
  plugins: [],
}
