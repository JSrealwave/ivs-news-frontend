import type { Metadata } from "next";

import "./globals.css";
import ClientProviders from "./ClientProviders";
import PageTracker from "../components/PageTracker";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-950 text-zinc-200 antialiased">
        <ClientProviders>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <PageTracker />
        </ClientProviders>
      </body>
    </html>
  );
}