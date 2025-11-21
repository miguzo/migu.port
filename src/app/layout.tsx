import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The migu Player",
  description: "Music Library",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload selection overlays */}
        <link rel="preload" as="image" href="/next/image/player_selected.png" />
        <link rel="preload" as="image" href="/next/image/cv_selected.png" />
        <link rel="preload" as="audio" href="/sounds/Ambient.mp3" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* REQUIRED for ENTER fade-out */}
        <div
          id="transition-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "black",
            opacity: 1,
            transition: "opacity 0.6s ease",
            zIndex: 9999999,
            pointerEvents: "none",
          }}
        />

        {children}
      </body>
    </html>
  );
}