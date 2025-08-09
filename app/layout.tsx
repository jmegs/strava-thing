import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STR-01: Strava Analysis",
  description: "track runs, copy data for LLMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-mono text-xs antialiased">
      <body>{children}</body>
    </html>
  );
}
