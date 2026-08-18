"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  LogOut,
  Moon,
  Save,
  Settings,
  Sun,
  User,
} from "lucide-react";

import UserMenu from "@/components/UserMenu";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("studyai-theme");

    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      setDarkMode(prefersDark);

      if (prefersDark) {
        document.documentElement.classList.add("dark");
      }
    }

    const savedNotifications =
      localStorage.getItem(
        "studyai-notifications"
      );

    if (savedNotifications !== null) {
      setNotifications(
        savedNotifications === "true"
      );
    }
  }, []);

  // =========================================================
  // THEME
  // =========================================================

  function toggleTheme() {
    const nextMode = !darkMode;

    setDarkMode(nextMode);

    if (nextMode) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "studyai-theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "studyai-theme",
        "light"
      );
    }

    showSaved();
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  function toggleNotifications() {
    const nextValue = !notifications;

    setNotifications(nextValue);

    localStorage.setItem(
      "studyai-notifications",
      String(nextValue)
    );

    showSaved();
  }

  // =========================================================
  // SAVE INDICATOR
  // =========================================================

  function showSaved() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    }

    window.location.href = "/login";
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div>
            <h1 className="font-semibold">
              Settings
            </h1>

            <p className="text-xs text-muted-foreground">
              Customize your StudyAI experience
            </p>
          </div>

          <UserMenu />
        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* BACK */}

        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Dashboard
        </Link>

        {/* TITLE */}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Settings
              </h2>

              <p className="text-sm text-muted-foreground">
                Manage your account and StudyAI preferences.
              </p>
            </div>
          </div>
        </div>

        {/* SAVED MESSAGE */}

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />

            Settings saved successfully.
          </div>
        )}

        <div className="space-y-5">
          {/* =================================================
              ACCOUNT
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="border-b border-border/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Account
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Manage your profile and account.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border/60">
              {/* PROFILE */}

              <Link
                href="/profile"
                className="flex items-center justify-between p-5 transition hover:bg-accent"
              >
                <div>
                  <p className="font-medium">
                    Profile
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Edit your name, email and avatar.
                  </p>
                </div>

                <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
              </Link>
            </div>
          </section>

          {/* =================================================
              APPEARANCE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="border-b border-border/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Sun className="h-5 w-5 text-orange-500" />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold">
                    Appearance
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Choose how StudyAI looks.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    Theme
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Currently using{" "}
                    {darkMode
                      ? "dark"
                      : "light"}{" "}
                    mode.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Switch to Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Switch to Dark
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="border-b border-border/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Bell className="h-5 w-5 text-blue-500" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Notifications
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Control StudyAI notification preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    Study notifications
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Allow StudyAI to show study-related notifications.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleNotifications}
                  aria-label="Toggle notifications"
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    notifications
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      notifications
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              STUDY PREFERENCES
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="border-b border-border/60 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Save className="h-5 w-5 text-green-500" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Study preferences
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Your StudyAI preferences are saved automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  AI Study Assistant
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Your uploaded documents, AI chats,
                  quizzes and study activity are connected
                  to your account.
                </p>
              </div>

              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-sm font-medium">
                  Dark mode
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Your selected theme is stored locally
                  on this device.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              DANGER ZONE
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-destructive/20 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="border-b border-destructive/10 p-5">
              <h3 className="font-semibold text-destructive">
                Account
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign out from your StudyAI account.
              </p>
            </div>

            <div className="p-5">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-destructive/20 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />

                Log out
              </button>
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <footer className="mt-10 border-t border-border/60 pt-6 pb-4 text-center text-xs text-muted-foreground">
          StudyAI • Learn smarter with AI ✨
        </footer>
      </div>
    </main>
  );
}