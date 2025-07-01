/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This is required to scan your React files
  ],
  theme: {
    extend: {},
  }, 
  theme: {
    extend: {
      animation: {
        borderGlow: 'spin 4s linear infinite',
      },
    },
  },
  plugins: [],
  plugins: [],
};

