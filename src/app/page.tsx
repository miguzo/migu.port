"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Track = { src: string; title: string };
type Project = {
  id: string;
  title: string;
  image?: string;
  readContent?: string;
  tracks: Track[];
};
const projects: Project[] = [
  {
    id: "Les Fragments (2025)",
    title: "Les Fragments (2025)",
    image: "/images/Fragments.webp",
    readContent: `Fragments project description…`,
    tracks: [
      { src: "/music/Fragments.mp3", title: "Les Fragments – Lidge" },
      { src: "/music/DoubleCross.mp3", title: "Les Fragments – Double Cross" },
      { src: "/music/Rabbit.mp3", title: "Les Fragments – Rabbit" },
    ],
  },
  {
    id: "Decarbonation (2025)",
    title: "Decarbonation (2025)",
    image: "/images/Card2.webp",
    readContent: `Decarbonation project description…`,
    tracks: [
      { src: "/music/track4.mp3", title: "City Loop" },
      { src: "/music/track5.mp3", title: "Echo Chamber" },
      { src: "/music/track6.mp3", title: "Sleepless" },
    ],
  },
  {
    id: "Aggragate (2024)",
    title: "Aggragate (2024)",
    image: "/images/Card3.webp",
    readContent: `Aggragate project description…`,
    tracks: [
      { src: "/music/track7.mp3", title: "Melted Reel" },
      { src: "/music/track8.mp3", title: "Rewind Fade" },
      { src: "/music/track9.mp3", title: "Flutter Dust" },
    ],
  },
];

type Panel = "listen" | "read" | "about" | "journal";

export default function Home() {
  const [projectIdx, setProjectIdx] = useState(0);
  const [panel, setPanel] = useState<Panel>("listen");
  const [panelOpen, setPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Stop audio when switching projects
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTrack(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [projectIdx]);

  // Audio handlers
  function playTrack(track: Track) {
    setCurrentTrack(track);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }, 0);
  }
  function togglePlayPause() {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  // Swipe for cards (left/right)
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      // Swipe left/right changes card
      setProjectIdx(idx =>
        (idx + (dx < 0 ? 1 : -1) + projects.length) % projects.length
      );
    }
    touchX.current = null;
    touchY.current = null;
  }

  // Keyboard navigation (← →)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (panelOpen) return;
      if (e.key === "ArrowLeft")
        setProjectIdx(idx => (idx - 1 + projects.length) % projects.length);
      if (e.key === "ArrowRight")
        setProjectIdx(idx => (idx + 1) % projects.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  // Accessibility: Only one main
  // aria-hidden only used for overlays, which are not focusable

  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-zinc-900 transition-colors"
      style={{ touchAction: "pan-y" }}
    >
      <div className="mt-8 w-full max-w-sm flex flex-col items-center">
        {/* Card */}
        <div
          className="relative w-full"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
        >
          {/* Image + Title */}
          <div className="bg-white dark:bg-zinc-800/90 rounded-2xl shadow-xl px-5 py-6 flex flex-col items-center">
            {projects[projectIdx].image && (
              <Image
                src={projects[projectIdx].image!}
                alt={projects[projectIdx].title}
                width={160}
                height={160}
                className="rounded-xl object-cover shadow mb-3"
                priority
              />
            )}
            <h2 className="text-base font-bold text-center text-black dark:text-white">
              {projects[projectIdx].title}
            </h2>
            {/* Playlist */}
            <ul className="my-3 w-full">
              {projects[projectIdx].tracks.map(track => (
                <li key={track.src} className="mb-1">
                  <button
                    className={`w-full text-left px-3 py-1 rounded-md transition
                      ${currentTrack?.src === track.src
                        ? "bg-yellow-200 dark:bg-zinc-700 font-bold"
                        : "bg-transparent hover:bg-gray-200 dark:hover:bg-zinc-700"}
                      text-black dark:text-white`}
                    onClick={() => playTrack(track)}
                  >
                    {track.title}
                  </button>
                </li>
              ))}
            </ul>
            {/* Controls */}
            {currentTrack && (
              <div className="flex items-center gap-3 justify-center mt-2">
                <button
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="px-3 py-1 rounded-full bg-gray-200 dark:bg-zinc-700"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
                  aria-label="Toggle theme"
                  className="px-3 py-1 rounded-full bg-gray-200 dark:bg-zinc-700"
                >
                  {theme === "dark" ? "☀️" : "🌙"}
                </button>
              </div>
            )}
            {/* Audio element */}
            {currentTrack && (
              <audio
                ref={audioRef}
                src={currentTrack.src}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                hidden
                preload="none"
              />
            )}
            {/* Panel Buttons */}
            <div className="flex gap-2 mt-5 justify-center">
              {(["listen", "read", "about", "journal"] as Panel[]).map(tab =>
                tab !== "listen" && (
                  <button
                    key={tab}
                    className={`px-3 py-1 text-sm rounded bg-gray-100 dark:bg-zinc-700 ${
                      panelOpen && panel === tab
                        ? "border-2 border-yellow-400"
                        : "border border-gray-300 dark:border-zinc-600"
                    }`}
                    onClick={() => {
                      setPanel(tab);
                      setPanelOpen(true);
                    }}
                  >
                    {tab[0].toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
          {/* Card Navigation (arrows) */}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button
              aria-label="Previous project"
              className="p-2 text-black dark:text-white"
              onClick={() =>
                setProjectIdx(idx => (idx - 1 + projects.length) % projects.length)
              }
              tabIndex={0}
            >
              ◀
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              aria-label="Next project"
              className="p-2 text-black dark:text-white"
              onClick={() =>
                setProjectIdx(idx => (idx + 1) % projects.length)
              }
              tabIndex={0}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Panels (fade only, accessible, one main landmark) */}
      {panelOpen && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 flex items-end justify-center bg-black/40 z-40 animate-fadein"
          onClick={() => setPanelOpen(false)}
          style={{ animation: "fadein 0.15s" }}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-zinc-800 rounded-t-2xl p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <strong className="capitalize text-lg text-black dark:text-white">{panel}</strong>
              <button onClick={() => setPanelOpen(false)} aria-label="Close panel">
                ✕
              </button>
            </div>
            <div className="text-gray-800 dark:text-gray-100 text-sm">
              {panel === "read" && projects[projectIdx].readContent}
              {panel === "about" && (
                <div>
                  <b>About</b>
                  <br />Welcome! I&apos;m Igor Dubreucq, a freelance sound artist and composer.
                  <br />
                  Contact: <a href="mailto:igordubreucq.pro@gmail.com" className="underline">igordubreucq.pro@gmail.com</a>
                </div>
              )}
              {panel === "journal" && (
                <div>
                  What happened and what&apos;s to come?<br />
                  <a
                    href="https://www.mouvement.net/arts/octobre-numerique-a-arles-faire-monde-quand-tout-est-k-o?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    mouvement.net/arts/octobre-numerique
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadein { animation: fadein 0.18s; }
      `}</style>
    </main>
  );
}
