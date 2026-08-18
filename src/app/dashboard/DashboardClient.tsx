"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Download,
  FileText,
  MessageCircle,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Upload,
  User,
  X,
  Smartphone,
  Zap,
  ShieldCheck,
  Minimize2,
  Maximize2,
} from "lucide-react";

import UserMenu from "@/components/UserMenu";

type RecentChat = {
  id: string;
  title: string;
  createdAt: string;
};

type DocumentItem = {
  id: string;
  originalName?: string;
  filename?: string;
  createdAt?: string;
};

type Profile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export default function DashboardClient() {
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  /* =========================================================
     PWA
  ========================================================= */

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  /* =========================================================
     iOS
  ========================================================= */

  const [isIOS, setIsIOS] = useState(false);

  /* =========================================================
     WHY APP BUBBLE
  ========================================================= */

  const [showWhyBubble, setShowWhyBubble] = useState(true);
  const [minimizedWhyBubble, setMinimizedWhyBubble] =
    useState(false);

  /* =========================================================
     TEMPORARY INTRO
  ========================================================= */

  const [showIntroBubble, setShowIntroBubble] = useState(false);
  const [introBubbleClosed, setIntroBubbleClosed] =
    useState(false);

  /* =========================================================
     THEME
  ========================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("ai-study-theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      document.documentElement.classList.toggle(
        "dark",
        prefersDark
      );

      setDarkMode(prefersDark);
    }

    setThemeLoaded(true);
  }, []);

  function toggleDarkMode() {
    const nextMode = !darkMode;

    setDarkMode(nextMode);

    document.documentElement.classList.toggle(
      "dark",
      nextMode
    );

    localStorage.setItem(
      "ai-study-theme",
      nextMode ? "dark" : "light"
    );
  }

  /* =========================================================
     TEMPORARY APP INTRO BUBBLE
  ========================================================= */

  useEffect(() => {
    const alreadyShown =
      sessionStorage.getItem(
        "ai-study-intro-shown"
      );

    if (alreadyShown === "true") {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowIntroBubble(true);

      sessionStorage.setItem(
        "ai-study-intro-shown",
        "true"
      );
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function closeIntroBubble() {
    setShowIntroBubble(false);
    setIntroBubbleClosed(true);
  }

  /* =========================================================
     PWA
  ========================================================= */

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      const iosStandalone =
        (
          window.navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone === true;

      setIsInstalled(
        standalone || iosStandalone
      );
    };

    const detectIOS = () => {
      const userAgent =
        window.navigator.userAgent ||
        window.navigator.vendor ||
        "";

      const ios =
        /iPad|iPhone|iPod/.test(userAgent) ||
        (navigator.platform === "MacIntel" &&
          navigator.maxTouchPoints > 1);

      setIsIOS(ios);
    };

    checkInstalled();
    detectIOS();

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      setInstallPrompt(installEvent);

      const dismissed =
        localStorage.getItem(
          "ai-study-pwa-dismissed"
        );

      if (dismissed !== "true") {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      setShowInstallBanner(false);

      localStorage.setItem(
        "ai-study-pwa-installed",
        "true"
      );
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  async function installPWA() {
    if (!installPrompt) {
      return;
    }

    try {
      setInstalling(true);

      await installPrompt.prompt();

      const result =
        await installPrompt.userChoice;

      if (result.outcome === "accepted") {
        localStorage.setItem(
          "ai-study-pwa-installed",
          "true"
        );

        setShowInstallBanner(false);
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error(
        "PWA installation failed:",
        error
      );
    } finally {
      setInstalling(false);
    }
  }

  function dismissInstallBanner() {
    setShowInstallBanner(false);

    localStorage.setItem(
      "ai-study-pwa-dismissed",
      "true"
    );
  }

  /* =========================================================
     WHY APP BUBBLE
  ========================================================= */

  useEffect(() => {
    const hidden =
      localStorage.getItem(
        "ai-study-why-bubble-hidden"
      );

    const minimized =
      localStorage.getItem(
        "ai-study-why-bubble-minimized"
      );

    if (hidden === "true") {
      setShowWhyBubble(false);
    }

    if (minimized === "true") {
      setMinimizedWhyBubble(true);
    }
  }, []);

  function closeWhyBubble() {
    setShowWhyBubble(false);

    localStorage.setItem(
      "ai-study-why-bubble-hidden",
      "true"
    );
  }

  function toggleWhyBubble() {
    const next = !minimizedWhyBubble;

    setMinimizedWhyBubble(next);

    localStorage.setItem(
      "ai-study-why-bubble-minimized",
      String(next)
    );
  }

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadRecentChats();
    loadDocuments();
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoadingProfile(true);

      const response = await fetch(
        "/api/profile",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setProfile(null);
        return;
      }

      const data = await response.json();

      const user =
        data.user ||
        data.profile ||
        data.data ||
        data;

      if (user) {
        setProfile({
          id: user.id ?? undefined,
          name: user.name ?? null,
          email: user.email ?? null,
          avatarUrl:
            user.avatarUrl ?? null,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error
      );

      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }

  async function loadRecentChats() {
    try {
      const response = await fetch(
        "/api/chats/recent",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setRecentChats([]);
        return;
      }

      const data = await response.json();

      const chats =
        data.chats ||
        data.data ||
        [];

      if (Array.isArray(chats)) {
        setRecentChats(chats);
      }
    } catch (error) {
      console.error(
        "Failed to load recent chats:",
        error
      );

      setRecentChats([]);
    } finally {
      setLoadingChats(false);
    }
  }

  async function loadDocuments() {
    try {
      const response = await fetch(
        "/api/documents",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        setDocuments([]);
        return;
      }

      const data = await response.json();

      const docs =
        data.documents ||
        data.data ||
        [];

      if (Array.isArray(docs)) {
        setDocuments(docs);
      }
    } catch (error) {
      console.error(
        "Failed to load documents:",
        error
      );

      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function formatDate(date?: string) {
    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  }

  function getInitials(
    name?: string | null,
    email?: string | null
  ) {
    const value =
      name?.trim() ||
      email?.trim() ||
      "User";

    const parts = value.split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return value
      .slice(0, 2)
      .toUpperCase();
  }

  const initials = getInitials(
    profile?.name,
    profile?.email
  );

  /* =========================================================
     PROFILE AVATAR
  ========================================================= */

  function ProfileAvatar({
    size = "large",
  }: {
    size?: "small" | "large";
  }) {
    const sizeClasses =
      size === "large"
        ? "h-12 w-12 sm:h-14 sm:w-14"
        : "h-9 w-9";

    const textSize =
      size === "large"
        ? "text-sm sm:text-base"
        : "text-xs";

    return (
      <div
        className={`relative flex ${sizeClasses} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 ${textSize} font-bold text-primary shadow-sm`}
      >
        {!loadingProfile &&
        profile?.avatarUrl ? (
          <img
            src="/api/profile/avatar/view"
            alt={
              profile.name ||
              "Profile avatar"
            }
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />
        ) : loadingProfile ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* =====================================================
          STICKY HEADER
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-[9999]
          w-full
          border-b
          border-border/70
          bg-background
          shadow-sm
        "
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
        }}
      >
        <div
          className="
            flex
            min-h-16
            w-full
            items-center
            justify-between
            gap-3
            px-3
            sm:px-6
          "
        >
          {/* LOGO */}

          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
              <Brain className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold sm:text-base">
                AI Study Assistant
              </h1>

              <p className="hidden text-xs text-muted-foreground sm:block">
                Your personal AI study companion
              </p>
            </div>
          </Link>

          {/* HEADER ACTIONS */}

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

            {!isInstalled &&
              installPrompt && (
                <button
                  type="button"
                  onClick={installPWA}
                  disabled={installing}
                  className="
                    flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    bg-background
                    px-3
                    text-xs
                    font-semibold
                    transition
                    hover:bg-muted
                    disabled:opacity-60
                    sm:text-sm
                  "
                >
                  {installing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                  ) : (
                    <Download className="h-4 w-4 text-primary" />
                  )}

                  <span className="hidden sm:inline">
                    Install
                  </span>
                </button>
              )}

            {themeLoaded && (
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  bg-background
                  transition
                  hover:bg-muted
                  active:scale-95
                "
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            )}

            <UserMenu />
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* PROFILE */}

        <section className="mb-6 flex items-center justify-between gap-3 sm:mb-8">

          <div className="flex min-w-0 items-center gap-3">

            <Link
              href="/profile"
              className="group relative block shrink-0 rounded-full"
            >
              <ProfileAvatar size="large" />

              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />
            </Link>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Welcome back
              </p>

              <h2 className="truncate text-base font-bold sm:text-lg">
                {loadingProfile
                  ? "Loading..."
                  : profile?.name || "Student"}
              </h2>

              {profile?.email && (
                <p className="max-w-[180px] truncate text-xs text-muted-foreground sm:max-w-xs">
                  {profile.email}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </section>

        {/* HERO */}

        <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-8">

          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI-powered learning
            </div>

            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Learn smarter.
              <br />
              <span className="text-primary">
                Study better.
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Ask questions, understand difficult topics,
              summarize notes, generate quizzes, and revise
              with flashcards — all in one place.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">

              <Link
                href="/chat"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                Start Studying
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/chat"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-background/70 px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </Link>

            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">

              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                Ask anything
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                Study PDFs
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                AI quizzes
              </span>

              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                Flashcards
              </span>

            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-8 sm:mt-10">

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Quick actions
            </h2>

            <p className="text-sm text-muted-foreground">
              Choose how you want to study.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

            {[
              {
                icon: MessageCircle,
                title: "Ask AI",
                description:
                  "Ask questions about any topic.",
              },
              {
                icon: FileText,
                title: "Summarize",
                description:
                  "Turn long study material into concise notes.",
              },
              {
                icon: Brain,
                title: "Take a Quiz",
                description:
                  "Test yourself with AI-generated questions.",
              },
              {
                icon: BookOpen,
                title: "Flashcards",
                description:
                  "Revise important concepts quickly.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href="/chat"
                  className="group rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:bg-muted/50 hover:shadow-md sm:p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>

                  <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
              );
            })}

          </div>
        </section>

        {/* RECENT CHATS */}

        <section className="mt-10 sm:mt-12">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold">
                Recent chats
              </h2>

              <p className="text-sm text-muted-foreground">
                Continue where you left off.
              </p>
            </div>

            <Link
              href="/chat"
              className="shrink-0 text-sm font-medium text-primary hover:underline"
            >
              Open chat
            </Link>

          </div>

          {loadingChats ? (
            <div className="flex items-center justify-center rounded-2xl border p-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                Loading recent chats...
              </div>
            </div>
          ) : recentChats.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-7 text-center sm:p-8">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No recent chats
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Start a conversation with your AI study assistant.
              </p>

              <Link
                href="/chat"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Link>

            </div>
          ) : (
            <div className="grid gap-2.5">

              {recentChats
                .slice(0, 5)
                .map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/chat?chatId=${encodeURIComponent(
                      chat.id
                    )}`}
                    className="group flex min-w-0 items-center gap-3 rounded-2xl border bg-card p-3.5 shadow-sm transition hover:bg-muted/50 hover:shadow-md sm:gap-4 sm:p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {chat.title ||
                          "Untitled chat"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(
                          chat.createdAt
                        )}
                      </p>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1" />
                  </Link>
                ))}

            </div>
          )}
        </section>

        {/* DOCUMENTS */}

        <section className="mt-10 sm:mt-12">

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold">
                Your documents
              </h2>

              <p className="text-sm text-muted-foreground">
                PDFs you have uploaded for studying.
              </p>
            </div>

            <Link
              href="/chat"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Upload PDF
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

          {loadingDocuments ? (
            <div className="flex items-center justify-center rounded-2xl border p-10">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
                Loading documents...
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-7 text-center sm:p-8">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No documents yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Upload a PDF to start asking questions about it.
              </p>

              <Link
                href="/chat"
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Upload className="h-4 w-4" />
                Upload PDF
              </Link>

            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {documents
                .slice(0, 6)
                .map((document) => (
                  <Link
                    key={document.id}
                    href={`/chat?documentId=${encodeURIComponent(
                      document.id
                    )}`}
                    className="group rounded-2xl border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {document.originalName ||
                            document.filename ||
                            "Untitled document"}
                        </p>

                        {document.createdAt && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(
                              document.createdAt
                            )}
                          </p>
                        )}
                      </div>

                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Open document
                      </span>

                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}

            </div>
          )}
        </section>

      </div>

      {/* =====================================================
          PWA INSTALL BANNER
      ===================================================== */}

      {!isInstalled &&
        showInstallBanner &&
        (installPrompt || isIOS) && (
          <div
            className="
              fixed
              inset-x-3
              bottom-3
              z-[9998]
              sm:bottom-6
              sm:left-6
              sm:right-auto
              sm:w-[390px]
            "
          >
            <div className="relative overflow-hidden rounded-3xl border bg-background p-4 shadow-2xl sm:p-5">

              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />

              <button
                type="button"
                onClick={dismissInstallBanner}
                aria-label="Close install banner"
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative flex gap-3 pr-6">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Install the app
                  </p>

                  <h3 className="mt-1 text-sm font-bold sm:text-base">
                    Study faster with AI Study Assistant
                  </h3>

                  {isIOS &&
                  !installPrompt ? (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      On iPhone or iPad, tap the
                      <strong>
                        {" "}
                        Share{" "}
                      </strong>
                      button in Safari and choose
                      <strong>
                        {" "}
                        Add to Home Screen
                      </strong>
                      .
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Install the app for a faster,
                      app-like study experience.
                    </p>
                  )}

                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-3 gap-2">

                <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                  <Zap className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[10px] font-medium">
                    Faster
                  </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                  <Smartphone className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[10px] font-medium">
                    App-like
                  </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                  <ShieldCheck className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-[10px] font-medium">
                    Convenient
                  </p>
                </div>

              </div>

              {installPrompt &&
                !isIOS && (
                  <div className="relative mt-4 flex gap-2">

                    <button
                      type="button"
                      onClick={installPWA}
                      disabled={installing}
                      className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                    >
                      {installing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}

                      {installing
                        ? "Installing..."
                        : "Install App"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        dismissInstallBanner
                      }
                      className="rounded-xl border px-4 py-2 text-xs font-medium hover:bg-muted"
                    >
                      Later
                    </button>

                  </div>
                )}

              {isIOS &&
                !installPrompt && (
                  <button
                    type="button"
                    onClick={
                      dismissInstallBanner
                    }
                    className="relative mt-4 w-full rounded-xl border px-4 py-2.5 text-xs font-medium hover:bg-muted"
                  >
                    Got it
                  </button>
                )}

            </div>
          </div>
        )}

      {/* =====================================================
          WHY APP MINIMIZED
      ===================================================== */}

      {showWhyBubble &&
        minimizedWhyBubble && (
          <div className="fixed bottom-3 left-3 z-[9990] sm:bottom-6 sm:left-6">

            <button
              type="button"
              onClick={toggleWhyBubble}
              className="group flex items-center gap-2.5 rounded-2xl border bg-background px-3 py-2.5 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-[10px] font-medium uppercase tracking-wider text-primary">
                  AI Study Assistant
                </p>

                <p className="text-xs font-semibold">
                  Why this app?
                </p>
              </div>

              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

          </div>
        )}

      {/* =====================================================
          WHY APP FULL
      ===================================================== */}

      {showWhyBubble &&
        !minimizedWhyBubble && (
          <div className="fixed bottom-3 left-3 z-[9990] w-[calc(100vw-1.5rem)] max-w-sm sm:bottom-6 sm:left-6">

            <div className="relative overflow-hidden rounded-3xl border bg-background p-4 shadow-2xl sm:p-5">

              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />

              <div className="absolute right-3 top-3 flex items-center gap-1">

                <button
                  type="button"
                  onClick={toggleWhyBubble}
                  aria-label="Minimize"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={closeWhyBubble}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              <div className="relative">

                <div className="flex items-start gap-3 pr-16">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary sm:text-xs">
                      Why this app?
                    </p>

                    <h3 className="mt-1 text-sm font-bold leading-5 sm:text-base">
                      Built for students who want to study smarter.
                    </h3>

                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                  AI Study Assistant turns your study material
                  into something easier to understand, practice,
                  and revise.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">

                  {[
                    {
                      icon: MessageCircle,
                      title: "Ask anything",
                      text: "Get explanations in simple language.",
                    },
                    {
                      icon: FileText,
                      title: "Study PDFs",
                      text: "Ask questions directly from your notes.",
                    },
                    {
                      icon: Brain,
                      title: "Practice",
                      text: "Generate quizzes to test yourself.",
                    },
                    {
                      icon: BookOpen,
                      title: "Revise",
                      text: "Create flashcards for quick revision.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl bg-muted/60 p-3"
                      >
                        <Icon className="mb-2 h-4 w-4 text-primary" />

                        <p className="text-xs font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
                          {item.text}
                        </p>
                      </div>
                    );
                  })}

                </div>

                <div className="mt-4 flex items-center gap-3">

                  <p className="min-w-0 flex-1 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
                    Made for learning, revision & exams.
                  </p>

                  <Link
                    href="/chat"
                    onClick={closeWhyBubble}
                    className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Try it
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                </div>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          DEVELOPER
      ===================================================== */}

      <Link
        href="https://www.instagram.com/_imnine9_/"
        target="_blank"
        rel="noopener noreferrer"
        title="Developer"
        className="
          group
          fixed
          bottom-3
          right-3
          z-[9989]
          flex
          items-center
          gap-2.5
          rounded-2xl
          border
          bg-background
          px-3
          py-2.5
          shadow-xl
          transition-all
          hover:-translate-y-1
          hover:shadow-2xl
          sm:bottom-6
          sm:right-6
          sm:px-4
          sm:py-3
        "
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 sm:h-10 sm:w-10">

          <img
            src="/developer-avatar.png"
            alt="Gyanam G."
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />

          <User className="absolute h-4 w-4 text-primary" />

        </div>

        <div className="hidden sm:block">

          <p className="text-[10px] text-muted-foreground">
            Built by
          </p>

          <p className="text-sm font-semibold">
            Gyanam G.
          </p>

        </div>

        <ArrowRight className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
      </Link>

      {/* =====================================================
          TEMPORARY APP INTRO BUBBLE
      ===================================================== */}

      {showIntroBubble &&
        !introBubbleClosed && (
          <div
            className="
              fixed
              bottom-5
              left-1/2
              z-[9990]
              w-[calc(100vw-1.5rem)]
              max-w-md
              -translate-x-1/2
              animate-in
              fade-in
              slide-in-from-bottom-5
              duration-500
              sm:bottom-7
              sm:left-7
              sm:translate-x-0
            "
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-primary/20
                bg-background/95
                p-4
                shadow-2xl
                backdrop-blur-xl
                sm:p-5
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-primary/20
                  blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -left-16
                  h-36
                  w-36
                  rounded-full
                  bg-primary/10
                  blur-3xl
                "
              />

              <button
                type="button"
                onClick={closeIntroBubble}
                aria-label="Close introduction"
                className="
                  absolute
                  right-3
                  top-3
                  z-10
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative">

                <div className="flex items-start gap-3 pr-8">

                  <div
                    className="
                      relative
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary/10
                      ring-1
                      ring-primary/20
                    "
                  >
                    <Sparkles
                      className="
                        h-5
                        w-5
                        animate-pulse
                        text-primary
                      "
                    />

                    <span
                      className="
                        absolute
                        -right-1
                        -top-1
                        h-2.5
                        w-2.5
                        rounded-full
                        bg-primary
                        shadow-[0_0_12px_hsl(var(--primary))]
                      "
                    />
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          rounded-full
                          bg-primary/10
                          px-2
                          py-1
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-primary
                        "
                      >
                        New
                      </span>

                      <span className="text-[10px] text-muted-foreground">
                        AI Study Assistant
                      </span>

                    </div>

                    <h3 className="mt-1 text-base font-bold leading-5 sm:text-lg">
                      Your smarter way to study ✨
                    </h3>

                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                  Turn your questions, notes, and PDFs into
                  interactive learning. Ask AI, get simple
                  explanations, practice with quizzes, and
                  revise with flashcards — all in one place.
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">

                  <div className="rounded-2xl border bg-muted/40 p-2.5 text-center">

                    <MessageCircle className="mx-auto h-4 w-4 text-primary" />

                    <p className="mt-1 text-[10px] font-semibold">
                      Ask AI
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      Learn anything
                    </p>

                  </div>

                  <div className="rounded-2xl border bg-muted/40 p-2.5 text-center">

                    <Brain className="mx-auto h-4 w-4 text-primary" />

                    <p className="mt-1 text-[10px] font-semibold">
                      Practice
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      AI quizzes
                    </p>

                  </div>

                  <div className="rounded-2xl border bg-muted/40 p-2.5 text-center">

                    <BookOpen className="mx-auto h-4 w-4 text-primary" />

                    <p className="mt-1 text-[10px] font-semibold">
                      Revise
                    </p>

                    <p className="mt-0.5 text-[9px] text-muted-foreground">
                      Flashcards
                    </p>

                  </div>

                </div>

                <div className="mt-4 flex items-center gap-3">

                  <div className="flex min-w-0 flex-1 items-center gap-2">

                    <div className="flex -space-x-1">

                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/10">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>

                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/20">
                        <Brain className="h-3 w-3 text-primary" />
                      </div>

                      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary/30">
                        <BookOpen className="h-3 w-3 text-primary" />
                      </div>

                    </div>

                    <span className="truncate text-[10px] text-muted-foreground">
                      Built for students & exams
                    </span>

                  </div>

                  <Link
                    href="/chat"
                    onClick={closeIntroBubble}
                    className="
                      inline-flex
                      min-h-9
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-xl
                      bg-primary
                      px-3.5
                      py-2
                      text-xs
                      font-semibold
                      text-primary-foreground
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:opacity-90
                    "
                  >
                    Try it
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                </div>

              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          SMALL REOPEN BUTTON
      ===================================================== */}

      {!showIntroBubble &&
        introBubbleClosed && (
          <button
            type="button"
            onClick={() => {
              setIntroBubbleClosed(false);
              setShowIntroBubble(true);
            }}
            className="
              fixed
              bottom-5
              left-5
              z-[9990]
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              bg-background/95
              text-primary
              shadow-xl
              backdrop-blur-xl
              transition
              hover:-translate-y-1
              hover:shadow-2xl
              sm:bottom-7
              sm:left-7
            "
            aria-label="About AI Study Assistant"
            title="About AI Study Assistant"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        )}

    </div>
  );
}