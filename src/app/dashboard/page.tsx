"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  MessageCircle,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Upload,
  User,
  X,
} from "lucide-react";

import UserMenu from "@/components/UserMenu";

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   COMPONENT
========================================================= */

export default function DashboardPage() {
  /* =========================================================
     DATA
  ========================================================= */

  const [recentChats, setRecentChats] =
    useState<RecentChat[]>([]);

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  /* =========================================================
     LOADING
  ========================================================= */

  const [loadingChats, setLoadingChats] =
    useState(true);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  /* =========================================================
     PROFILE
  ========================================================= */

  const [profile, setProfile] =
    useState<Profile | null>(null);

  /* =========================================================
     THEME
  ========================================================= */

  const [darkMode, setDarkMode] =
    useState(false);

  const [themeLoaded, setThemeLoaded] =
    useState(false);

  /* =========================================================
     WHY BUBBLE
  ========================================================= */

  const [showWhyBubble, setShowWhyBubble] =
    useState(true);

  /* =========================================================
     THEME INITIALIZATION
  ========================================================= */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "ai-study-theme"
      );

    if (savedTheme === "dark") {
      document.documentElement.classList.add(
        "dark"
      );

      setDarkMode(true);
    } else if (
      savedTheme === "light"
    ) {
      document.documentElement.classList.remove(
        "dark"
      );

      setDarkMode(false);
    } else {
      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      if (prefersDark) {
        document.documentElement.classList.add(
          "dark"
        );

        setDarkMode(true);
      } else {
        document.documentElement.classList.remove(
          "dark"
        );

        setDarkMode(false);
      }
    }

    setThemeLoaded(true);
  }, []);

  /* =========================================================
     TOGGLE DARK MODE
  ========================================================= */

  function toggleDarkMode() {
    const nextMode =
      !darkMode;

    setDarkMode(nextMode);

    if (nextMode) {
      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "ai-study-theme",
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "ai-study-theme",
        "light"
      );
    }
  }

  /* =========================================================
     WHY BUBBLE
  ========================================================= */

  useEffect(() => {
    const hidden =
      localStorage.getItem(
        "ai-study-why-bubble-hidden"
      );

    if (hidden === "true") {
      setShowWhyBubble(false);
    }
  }, []);

  function closeWhyBubble() {
    setShowWhyBubble(false);

    localStorage.setItem(
      "ai-study-why-bubble-hidden",
      "true"
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

  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  async function loadProfile() {
    try {
      setLoadingProfile(true);

      const response =
        await fetch(
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

      const data =
        await response.json();

      /*
       * Supports all of these response formats:
       *
       * { user: {...} }
       * { profile: {...} }
       * { data: {...} }
       * { id, name, email, avatarUrl }
       */

      const user =
        data.user ||
        data.profile ||
        data.data ||
        data;

      if (user) {
        setProfile({
          id:
            user.id ??
            undefined,

          name:
            user.name ??
            null,

          email:
            user.email ??
            null,

          avatarUrl:
            user.avatarUrl ??
            null,
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

  /* =========================================================
     LOAD RECENT CHATS
  ========================================================= */

  async function loadRecentChats() {
    try {
      const response =
        await fetch(
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

      const data =
        await response.json();

      const chats =
        data.chats ||
        data.data ||
        [];

      if (
        Array.isArray(chats)
      ) {
        setRecentChats(
          chats
        );
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

  /* =========================================================
     LOAD DOCUMENTS
  ========================================================= */

  async function loadDocuments() {
    try {
      const response =
        await fetch(
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

      const data =
        await response.json();

      const docs =
        data.documents ||
        data.data ||
        [];

      if (
        Array.isArray(docs)
      ) {
        setDocuments(
          docs
        );
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
     FORMAT DATE
  ========================================================= */

  function formatDate(
    date?: string
  ) {
    if (!date) {
      return "";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString(
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

  /* =========================================================
     AVATAR HELPERS
  ========================================================= */

  function getInitials(
    name?: string | null,
    email?: string | null
  ) {
    const value =
      name?.trim() ||
      email?.trim() ||
      "User";

    const parts =
      value.split(
        /\s+/
      );

    if (
      parts.length >= 2
    ) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return value
      .slice(0, 2)
      .toUpperCase();
  }

  const initials =
    getInitials(
      profile?.name,
      profile?.email
    );

  /* =========================================================
     AVATAR
  ========================================================= */

  function ProfileAvatar({
    size = "large",
  }: {
    size?: "small" | "large";
  }) {
    const sizeClasses =
      size === "large"
        ? "h-12 w-12"
        : "h-9 w-9";

    const textSize =
      size === "large"
        ? "text-sm"
        : "text-xs";

    return (
      <div
        className={`relative flex ${sizeClasses} shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 ${textSize} font-bold text-primary shadow-sm`}
      >
        {!loadingProfile &&
        profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={
              profile.name ||
              "Profile avatar"
            }
            className="h-full w-full object-cover"
          />
        ) : loadingProfile ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        ) : (
          <span>
            {initials}
          </span>
        )}
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur transition-colors duration-300 sm:px-6">

        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0">

            <h1 className="truncate text-base font-bold">
              AI Study Assistant
            </h1>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Your personal AI study companion
            </p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">

          {/* DARK MODE */}

          {themeLoaded && (
            <button
              type="button"
              onClick={
                toggleDarkMode
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background transition-all duration-200 hover:bg-muted"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )}

          {/* USER MENU */}

          <UserMenu />

        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* PROFILE / AVATAR WELCOME */}
        {/* ================================================= */}

        <section className="mb-6 flex items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            {/* UPDATED AVATAR */}

            <Link
              href="/profile"
              aria-label="Open profile"
              className="group relative block shrink-0 rounded-full"
            >
              <ProfileAvatar size="large" />

              {/* ONLINE / PROFILE INDICATOR */}

              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500" />

              {/* HOVER RING */}

              <span className="pointer-events-none absolute inset-0 rounded-full ring-0 ring-primary/30 transition-all duration-200 group-hover:ring-4" />
            </Link>

            {/* WELCOME */}

            <div className="min-w-0">

              <p className="text-xs text-muted-foreground">
                Welcome back
              </p>

              <h2 className="truncate text-lg font-bold">
                {loadingProfile
                  ? "Loading..."
                  : profile?.name ||
                    "Student"}
              </h2>

              {profile?.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {profile.email}
                </p>
              )}

            </div>

          </div>

          {/* PROFILE BUTTON */}

          <Link
            href="/profile"
            className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex"
          >
            <User className="h-4 w-4" />

            Profile
          </Link>

        </section>

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 transition-colors duration-300 sm:p-8">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">

              <Sparkles className="h-3.5 w-3.5 text-primary" />

              AI-powered learning

            </div>

            <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Learn smarter.
              <br />
              Study better.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Ask questions, understand difficult topics,
              summarize notes, generate quizzes, and revise
              with flashcards.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />

                Start Studying

                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <Upload className="h-4 w-4" />

                Upload PDF
              </Link>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <section className="mt-8">

          <div className="mb-4">

            <h2 className="text-lg font-semibold">
              Quick actions
            </h2>

            <p className="text-sm text-muted-foreground">
              Choose how you want to study.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/chat"
              className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:bg-muted/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                Ask AI
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Ask questions about any topic.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/chat"
              className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:bg-muted/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                Summarize
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Turn long study material into concise notes.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/chat"
              className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:bg-muted/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                Take a Quiz
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Test yourself with AI-generated questions.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/chat"
              className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:bg-muted/50"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>

              <h3 className="font-semibold">
                Flashcards
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Revise important concepts quickly.
              </p>

              <ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

          </div>

        </section>

        {/* ================================================= */}
        {/* RECENT CHATS */}
        {/* ================================================= */}

        <section className="mt-10">

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
              className="text-sm font-medium text-primary hover:underline"
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

            <div className="rounded-2xl border border-dashed p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No recent chats
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Start a conversation with your AI study assistant.
              </p>

              <Link
                href="/chat"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />

                New Chat
              </Link>

            </div>

          ) : (

            <div className="grid gap-3">

              {recentChats
                .slice(0, 5)
                .map((chat) => (

                  <Link
                    key={chat.id}
                    href={`/chat?chatId=${encodeURIComponent(
                      chat.id
                    )}`}
                    className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:bg-muted/50"
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

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                  </Link>

                ))}

            </div>
          )}

        </section>

        {/* ================================================= */}
        {/* DOCUMENTS */}
        {/* ================================================= */}

        <section className="mt-10">

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
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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

            <div className="rounded-2xl border border-dashed p-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 font-semibold">
                No documents yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Upload a PDF to start asking questions about it.
              </p>

              <Link
                href="/chat"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
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
                    className="group rounded-2xl border bg-card p-4 transition hover:bg-muted/50"
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

      {/* ================================================= */}
      {/* WHY THIS APP BUBBLE */}
      {/* ================================================= */}

      {showWhyBubble && (

        <div className="fixed bottom-6 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 sm:left-6">

          <div className="relative overflow-hidden rounded-3xl border bg-background/95 p-5 shadow-2xl backdrop-blur-xl">

            {/* DECORATIVE GLOW */}

            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closeWhyBubble
              }
              aria-label="Close information bubble"
              title="Close"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* CONTENT */}

            <div className="relative">

              <div className="flex items-start gap-3 pr-7">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Why this app?
                  </p>

                  <h3 className="mt-1 text-base font-bold">
                    Built for students who want to study smarter.
                  </h3>

                </div>

              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                AI Study Assistant helps you turn your study
                material into something easier to understand,
                practice, and revise.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">

                <div className="rounded-2xl bg-muted/60 p-3">

                  <MessageCircle className="mb-2 h-4 w-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Ask anything
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Get explanations in simple language.
                  </p>

                </div>

                <div className="rounded-2xl bg-muted/60 p-3">

                  <FileText className="mb-2 h-4 w-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Study PDFs
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Ask questions directly from your notes.
                  </p>

                </div>

                <div className="rounded-2xl bg-muted/60 p-3">

                  <Brain className="mb-2 h-4 w-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Practice
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Generate quizzes to test yourself.
                  </p>

                </div>

                <div className="rounded-2xl bg-muted/60 p-3">

                  <BookOpen className="mb-2 h-4 w-4 text-primary" />

                  <p className="text-xs font-semibold">
                    Revise
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                    Create flashcards for quick revision.
                  </p>

                </div>

              </div>

              <div className="mt-4 flex items-center justify-between gap-3">

                <p className="text-[11px] text-muted-foreground">
                  Made for learning, revision & exams.
                </p>

                <Link
                  href="/chat"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Try it

                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* DEVELOPER BUBBLE */}
      {/* ================================================= */}

      <Link
        href="https://www.instagram.com/_imnine9_/"
        className={`group fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-2xl border bg-background px-4 py-3 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
          showWhyBubble
            ? "hidden lg:flex"
            : "flex"
        }`}
        title="Developer"
        target="_blank"
        rel="noopener noreferrer"
      >

        {/* DEVELOPER AVATAR */}

        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">

          <img
            src="/developer-avatar.png"
            alt="Gyanam G."
            className="h-full w-full object-cover transition group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display =
                "none";
            }}
          />

          <User className="absolute h-4 w-4 text-primary" />

        </div>

        <div className="hidden sm:block">

          <p className="text-xs text-muted-foreground">
            Built by
          </p>

          <p className="text-sm font-semibold">
            Gyanam G.
          </p>

        </div>

      </Link>

    </main>
  );
}