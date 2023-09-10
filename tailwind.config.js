/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "press-start": ['"Press Start 2P"', "cursive"],
      },
      backgroundColor: {
        "custom-green": "#09FE61",
        "custom-blue": "#4303FF",
      },
      textColor: {
        "custom-green": "#09FE61",
      },
    },
  },
  plugins: [],
};
