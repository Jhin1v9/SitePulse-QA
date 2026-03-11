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
          50: "#ecf5ff",
          100: "#d7ebff",
          200: "#afd6ff",
          300: "#84c0ff",
          400: "#4ba4ff",
          500: "#1985ff",
          600: "#0268db",
          700: "#0152ad",
          800: "#043f82",
          900: "#0a365d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
