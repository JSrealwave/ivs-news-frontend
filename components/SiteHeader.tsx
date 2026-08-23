"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteContainer } from "./PageContainer";
import { SUBSCRIBE_URL } from "../lib/site";

const navLinks = [
  { href: "/news", label: "News" },
  { href: "/briefs", label: "Briefs" },
  { href: "/directory", label: "Directory" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <SiteContainer className="flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-white transition-colors hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          IVS News
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-1 overflow-x-auto sm:gap-2"
          >
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:px-4",
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
          <a
            href={SUBSCRIBE_URL}
            data-ivs-entity="subscribe"
            className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:px-4"
          >
            Subscribe
          </a>
        </div>
      </SiteContainer>
    </header>
  );
}
