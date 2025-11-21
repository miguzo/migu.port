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
  description: "Music Library ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PRELOAD YOUR HOVER PNGS */}
        <link
          rel="preload"
          as="image"
          href="/next/image/player_selected.png"
        />
        <link
          rel="preload"
          as="image"
          href="/next/image/cv_selected.png"
        />

        {/* (Optional) Preload ambient sound for faster decode */}
        <link
          rel="preload"
          as="audio"
          href="/sounds/Ambient.mp3"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* GLOBAL PAGE FADE-IN */}


        {/* PAGE CONTENT */}
        {children}
      </body>
    </html>
  );
}
