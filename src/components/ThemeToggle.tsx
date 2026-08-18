"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-10 w-10 rounded-xl border"
        aria-label="Change theme"
      />
    );
  }

  const dark =
    theme === "dark";

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(
          dark ? "light" : "dark"
        )
      }
      aria-label={
        dark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        dark
          ? "Light mode"
          : "Dark mode"
      }
      className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition hover:bg-muted active:scale-95"
    >
      {dark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}