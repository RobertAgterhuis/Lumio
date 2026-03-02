"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  const applyTheme = (t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    // Read saved preference or system preference
    const saved = localStorage.getItem("lumio-theme") as Theme | null;
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
      setThemeState("dark");
    }
  }, []);

  const setTheme = (t: Theme) => {
    applyTheme(t);
    setThemeState(t);
    localStorage.setItem("lumio-theme", t);
  };

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { theme, setTheme, toggle };
}
