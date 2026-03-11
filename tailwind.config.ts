/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx, ts, tsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#32C5F4",
        secondary: "#28466A",
        tertiary: "#ECBE1D",
        hover: "#289AC2",
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/')",
      },
    },
  },
  plugins: [],
};
