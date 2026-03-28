module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#ECF9FC',        // background color
        textPrimary: '#2F6F7E', // main text
        accent: '#5FB3C8',      // buttons / highlights
        neutral: '#9CA3AF',     // secondary text / borders
        white: '#FFFFFF',
      },
      spacing: {
        57.5: '230px', // sidebar expanded width
        18: '72px',    // sidebar collapsed width
        15: '60px',    // navbar height
      },
    },
  },
  plugins: [],
};