"use client";

import { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Save,
} from "lucide-react";
import Link from "next/link";

import UserAvatar from "@/components/UserAvatar";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/profile");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load profile."
        );
      }

      setUser(data.user);

      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setAvatarUrl(data.user.avatarUrl || "");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          avatarUrl,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update profile."
        );
      }

      setUser(data.user);

      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setAvatarUrl(data.user.avatarUrl || "");

      setCurrentPassword("");
      setNewPassword("");

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}

        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition hover:bg-muted disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}

            Logout
          </button>
        </div>

        {/* Profile Card */}

        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          {/* Profile Header */}

          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              avatarUrl={avatarUrl}
              size="lg"
            />

            <div>
              <h1 className="text-2xl font-bold">
                {user?.name || "Your Profile"}
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your account
              </p>
            </div>
          </div>

          {/* Messages */}

          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Avatar */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Avatar URL
              </label>

              <input
                type="url"
                value={avatarUrl}
                onChange={(event) =>
                  setAvatarUrl(event.target.value)
                }
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Paste a direct image URL to use a custom
                profile picture.
              </p>
            </div>

            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold">
                Change Password
              </h2>

              <p className="mb-5 mt-1 text-sm text-muted-foreground">
                Leave both fields empty if you don't want
                to change your password.
              </p>

              <div className="space-y-4">
                {/* Current */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Current Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border bg-background px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border bg-background px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-primary"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}