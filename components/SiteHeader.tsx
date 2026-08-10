"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteContainer } from "./PageContainer";

const navLinks = [
  { href: "/news", label: "News" },
  { href: "/briefs", label: "Briefs" },
  { href: "/directory", label: "Directory" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <SiteContainer className="flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white transition-colors hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          IVS News
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
                  isActive
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </SiteContainer>
    </header>
  );
}
