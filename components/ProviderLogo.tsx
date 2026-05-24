"use client";

import SmartImage from "./SmartImage";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function ProviderLogo({
  name,
  logoUrl,
  size = 48,
  className = "",
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  return (
    <SmartImage
      src={logoUrl}
      alt={`${name} logo`}
      objectFit="contain"
      showLoadingSkeleton
      className={`shrink-0 rounded-xl border border-zinc-700/80 bg-zinc-800/80 ${className}`}
      style={{ width: size, height: size }}
      placeholder={
        <div
          className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-sm font-semibold text-zinc-100"
          aria-hidden
        >
          {initialsFromName(name)}
        </div>
      }
    />
  );
}
