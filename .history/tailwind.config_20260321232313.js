/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#ECF9FC',
        textPrimary: '#2F6F7E',
        accent: '#5FB3C8',
        neutral: '#9CA3AF',
        white: '#FFFFFF',
      },
      spacing: {
        '57.5': '230px',
        '18': '72px',
        '15': '60px',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}