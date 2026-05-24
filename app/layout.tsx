
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "IVS News | Intelligent Video Surveillance",
  description: "Technical news, edge AI, computer vision techniques, deployments, and marketplace updates in intelligent video surveillance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-200 antialiased">
        <ClientProviders>
          <SiteHeader />
          {children}
        </ClientProviders>
        <Analytics />
      </body>
    </html>
  );
}