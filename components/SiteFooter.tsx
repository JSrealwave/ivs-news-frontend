import Link from "next/link";

import { SiteContainer } from "./PageContainer";
import SiteLogo from "./SiteLogo";
import { CONTACT_EMAIL, SITE_TAGLINE, SUBSCRIBE_URL } from "../lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <SiteContainer className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <SiteLogo compact />
          <p className="mt-2 text-sm text-zinc-500">{SITE_TAGLINE}</p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400"
        >
          <a
            href={SUBSCRIBE_URL}
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Subscribe
          </a>
          <Link
            href="/about"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            About
          </Link>
          <a
            href="/feed.xml"
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            RSS
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>
      </SiteContainer>
    </footer>
  );
}
