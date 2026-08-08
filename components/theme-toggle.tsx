"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("intervu_theme") as "dark" | "light" | null;
    const initialTheme = stored || "dark";
    setTheme(initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("intervu_theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl border border-slate-700/80 bg-slate-800/90 text-slate-300 shadow-xs"
        aria-label="Toggle theme"
      >
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="h-9 w-9 rounded-xl border border-slate-700/80 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white shadow-xs transition-colors"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-400" />
      )}
    </Button>
  );
}
