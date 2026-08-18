"use client";

import { User } from "lucide-react";

type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

export default function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "md",
}: UserAvatarProps) {
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() ||
    email?.charAt(0).toUpperCase() ||
    "?";

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-24 w-24 text-2xl",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={`${sizes[size]} rounded-full border object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full border bg-primary/10 font-semibold text-primary`}
    >
      {initials || <User className="h-5 w-5" />}
    </div>
  );
}