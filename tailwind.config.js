/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--bg-page)",
        shell: "var(--bg-shell)",
        panel: {
          DEFAULT: "var(--bg-panel)",
          elevated: "var(--bg-panel-elevated)",
        },
        surface: "var(--bg-surface)",
        interactive: "var(--bg-interactive)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          disabled: "var(--text-disabled)",
        },
        accent: {
          blue: "var(--accent-blue)",
          cyan: "var(--accent-cyan)",
          purple: "var(--accent-purple)",
          green: "var(--accent-green)",
          amber: "var(--accent-amber)",
          red: "var(--accent-red)",
        },
        edge: {
          blue: "var(--edge-blue)",
          purple: "var(--edge-purple)",
          green: "var(--edge-green)",
          amber: "var(--edge-amber)",
          red: "var(--edge-red)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "14px", letterSpacing: "0.02em" }],
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px", letterSpacing: "-0.01em" }],
        lg: ["20px", { lineHeight: "28px", letterSpacing: "-0.02em" }],
        xl: ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "2xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.03em" }],
        "3xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.04em" }],
        "4xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.04em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        surface: "var(--shadow-surface)",
        focus: "var(--shadow-focus)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scan: "scan 2s linear infinite",
        enter: "enter 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        enter: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

