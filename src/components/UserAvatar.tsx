"use client";

import Image from "next/image";

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
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-24 w-24",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-2xl",
  };

  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") ||
    email?.charAt(0).toUpperCase() ||
    "?";

  /*
   * Private Vercel Blob images are served
   * through our authenticated API route.
   *
   * The avatarUrl itself is NOT exposed
   * directly to the browser.
   */

  const imageSrc = avatarUrl
    ? `/api/profile/avatar/view?v=${encodeURIComponent(
        avatarUrl
      )}`
    : null;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ${sizeClasses[size]}`}
    >
      {imageSrc ? (
        <Image
          key={imageSrc}
          src={imageSrc}
          alt={name || "Profile photo"}
          fill
          unoptimized
          className="object-cover"
        />
      ) : (
        <span
          className={`font-semibold text-primary ${textSizes[size]}`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}