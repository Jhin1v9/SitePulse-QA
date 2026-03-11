"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "sitepulse-theme";

type Theme = "dark" | "light";

interface ThemeToggleProps {
  darkLabel: string;
  lightLabel: string;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.localStorage.setItem(THEME_KEY, theme);
}

export function ThemeToggle({ darkLabel, lightLabel }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      applyTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = prefersDark ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const nextTheme: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="inline-flex h-10 items-center rounded-full border border-slate-300 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
    >
      {theme === "dark" ? lightLabel : darkLabel}
    </button>
  );
}
