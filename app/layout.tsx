
import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "IVS Verge | Intelligent Video Surveillance News",
  description: "Technical news, edge AI, computer vision techniques, deployments, and marketplace updates in intelligent video surveillance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ margin: 0, padding: 0 }} className="bg-zinc-950 text-zinc-200 min-h-screen">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}