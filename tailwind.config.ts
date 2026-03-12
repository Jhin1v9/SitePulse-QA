import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(23,192,255,0.25), 0 20px 70px rgba(0,0,0,0.35)",
      },
      colors: {
        studio: {
          50: "#ecfdf8",
          100: "#d2f9ee",
          200: "#a8f2dd",
          300: "#75e8ca",
          400: "#3dd8b6",
          500: "#1bbf9a",
          600: "#129e7f",
          700: "#117f68",
          800: "#136553",
          900: "#135345",
        },
      },
    },
  },
  plugins: [],
};

export default config;
