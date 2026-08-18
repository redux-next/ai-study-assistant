"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import Link from "next/link";

import UserAvatar from "./UserAvatar";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
};

export default function UserMenu() {
  const {
    data: session,
    status,
  } = useSession();

  const [open, setOpen] =
    useState(false);

  const [profileUser, setProfileUser] =
    useState<ProfileUser | null>(null);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session?.user
    ) {
      return;
    }

    async function loadProfile() {
      try {
        const response =
          await fetch("/api/profile", {
            cache: "no-store",
          });

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data?.user) {
          setProfileUser(data.user);
        }
      } catch (error) {
        console.error(
          "USER MENU PROFILE ERROR:",
          error
        );
      }
    }

    loadProfile();
  }, [
    status,
    session?.user?.id,
  ]);

  if (status === "loading") {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!session?.user) {
    return null;
  }

  /*
   * Prefer the freshly loaded profile from
   * the database.
   *
   * Fall back to the NextAuth session.
   */
  const user = {
    id:
      profileUser?.id ||
      session.user.id,

    name:
      profileUser?.name ??
      session.user.name,

    email:
      profileUser?.email ??
      session.user.email,

    avatarUrl:
      profileUser?.avatarUrl ??
      session.user.avatarUrl ??
      null,
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-muted"
      >
        <UserAvatar
          name={user.name}
          email={user.email}
          avatarUrl={user.avatarUrl}
          size="sm"
        />

        <div className="hidden max-w-[150px] text-left sm:block">
          <p className="truncate text-sm font-medium">
            {user.name || "Student"}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>

        <ChevronDown className="hidden h-4 w-4 sm:block" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 h-full w-full cursor-default"
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b p-4">
              <UserAvatar
                name={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
                size="md"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user.name || "Student"}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/profile"
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>

              <Link
                href="/settings"
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>

            <div className="border-t p-2">
              <button
                type="button"
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}