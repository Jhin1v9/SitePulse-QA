import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#050508',
          dark: '#0a0a0f',
          panel: '#12121a',
          border: '#1e1e2e',
          hover: '#252538',
        },
        neon: {
          blue: '#00f0ff',
          purple: '#b829f7',
          green: '#00ff88',
          amber: '#ffb800',
          red: '#ff3366',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
