"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { signOut } from "next-auth/react";

import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  LogOut,
  Save,
  Trash2,
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
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProfile();

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch("/api/profile");

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load profile."
        );
      }

      setUser(data.user);

      setName(
        data.user.name || ""
      );

      setEmail(
        data.user.email || ""
      );

      setAvatarUrl(
        data.user.avatarUrl || ""
      );
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

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, WEBP, or GIF image."
      );

      event.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  }

  function removeSelectedPhoto() {
    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadProfilePhoto(
    file: File
  ): Promise<string> {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        "/api/profile/avatar",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Failed to upload profile photo."
      );
    }

    return data.url;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      let finalAvatarUrl =
        avatarUrl || null;

      /*
       * Upload new profile photo first.
       */
      if (selectedFile) {
        setUploading(true);

        finalAvatarUrl =
          await uploadProfilePhoto(
            selectedFile
          );

        setUploading(false);
      }

      const response =
        await fetch("/api/profile", {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            avatarUrl:
              finalAvatarUrl,
            currentPassword,
            newPassword,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update profile."
        );
      }

      setUser(data.user);

      setName(
        data.user.name || ""
      );

      setEmail(
        data.user.email || ""
      );

      setAvatarUrl(
        data.user.avatarUrl || ""
      );

      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setCurrentPassword("");
      setNewPassword("");

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      setUploading(false);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  async function removeProfilePhoto() {
    if (saving) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setSaving(true);

      const response =
        await fetch("/api/profile", {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            avatarUrl: null,
            currentPassword: "",
            newPassword: "",
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to remove profile photo."
        );
      }

      setUser(data.user);

      setAvatarUrl("");

      setSelectedFile(null);

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      setMessage(
        "Profile photo removed."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove profile photo."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </main>
    );
  }

  const displayedAvatar =
    previewUrl ||
    avatarUrl ||
    null;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}

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

        {/* CARD */}

        <div className="rounded-2xl border bg-card p-6 shadow-sm md:p-8">

          {/* PROFILE HEADER */}

          <div className="mb-8 flex flex-col items-center gap-4 text-center">

            <div className="relative">

              <UserAvatar
                name={user?.name}
                email={user?.email}
                avatarUrl={displayedAvatar}
                size="lg"
              />

              {selectedFile && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                  NEW
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                {user?.name ||
                  "Your Profile"}
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage your account
              </p>
            </div>
          </div>

          {/* MESSAGES */}

          {message && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* PROFILE PHOTO */}

            <div>
              <label className="mb-3 block text-sm font-medium">
                Profile photo
              </label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="shrink-0">
                  <UserAvatar
                    name={user?.name}
                    email={user?.email}
                    avatarUrl={displayedAvatar}
                    size="lg"
                  />
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImagePlus className="h-4 w-4" />

                    Choose photo
                  </button>

                  {(selectedFile ||
                    avatarUrl) && (
                    <button
                      type="button"
                      onClick={
                        selectedFile
                          ? removeSelectedPhoto
                          : removeProfilePhoto
                      }
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />

                      {selectedFile
                        ? "Cancel"
                        : "Remove"}
                    </button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

              <p className="mt-3 text-xs text-muted-foreground">
                JPG, PNG, WEBP, or GIF.
                Maximum size: 5 MB.
              </p>

              {selectedFile && (
                <p className="mt-1 text-xs text-primary">
                  Selected:{" "}
                  {selectedFile.name}
                </p>
              )}
            </div>

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Your name"
                disabled={saving}
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                disabled={saving}
                className="w-full rounded-xl border bg-background px-4 py-3 outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
            </div>

            {/* PASSWORD */}

            <div className="border-t pt-6">

              <h2 className="text-lg font-semibold">
                Change Password
              </h2>

              <p className="mb-5 mt-1 text-sm text-muted-foreground">
                Leave both fields empty if
                you don't want to change
                your password.
              </p>

              <div className="space-y-4">

                {/* CURRENT */}

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
                      value={
                        currentPassword
                      }
                      onChange={(event) =>
                        setCurrentPassword(
                          event.target
                            .value
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-xl border bg-background px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={saving}
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

                {/* NEW */}

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
                          event.target
                            .value
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-xl border bg-background px-4 py-3 pr-12 outline-none transition focus:ring-2 focus:ring-primary disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) =>
                            !value
                        )
                      }
                      disabled={saving}
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

            {/* SAVE */}

            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />

                  {uploading
                    ? "Uploading photo..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />

                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
