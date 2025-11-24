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
  title: "IGOR DUBREUCQ",
  description: "Emma's place",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload hover overlays */}
        <link rel="preload" as="image" href="/next/image/player_selected.png" />
        <link rel="preload" as="image" href="/next/image/cv_selected.png" />
        <link rel="preload" as="image" href="/next/image/tv.png" />
        <link rel="preload" as="image" href="/next/image/recorder.png" />

        {/* Preload ambient sound */}
        <link rel="preload" as="audio" href="/sounds/Ambient.mp3" />
      </head>

      {/* 
        ⭐ THIS IS THE IMPORTANT PART ⭐
        Tailwind dark mode was overriding your background and making it gray.
        Adding "bg-black" fixes the background on EVERY page.
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
