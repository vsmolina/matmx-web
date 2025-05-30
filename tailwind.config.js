/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#003cc5',
        black: '#000000',
        white: '#ffffff',
      },
    },
  },
  plugins: [],
}