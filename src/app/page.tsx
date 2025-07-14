"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Moon, Play, Pause, Instagram, Share2 } from "lucide-react";
import SUN3 from "@/components/icons/SUN3.svg";

// --- Types
type Track = { src: string; title: string };
type Project = {
  id: string;
  title: string;
  image?: string;
  readContent?: string;
  tracks: Track[];
};
type Panel = "listen" | "read" | "about" | "journal";

// --- Card Component
export default function Card({
  project,
  isActive,
  panel,
  panelOpen,
  playTrack,
  currentTracks,
  isPlaying,
  theme,
  togglePlayPause,
  setTheme,
  selectPanel,
  onCardTouchStart,
  onCardTouchMove,
  onCardTouchEnd,
  audioRef,
  cardSize,
}: {
  project: Project;
  isActive: boolean;
  panel: Panel;
  panelOpen: boolean;
  playTrack: (proj: Project, t: Track) => void;
  currentTracks: Track[];
  isPlaying: boolean;
  theme: "light" | "dark";
  togglePlayPause: () => void;
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  selectPanel: (p: Panel) => void;
  onCardTouchStart: React.TouchEventHandler<HTMLDivElement>;
  onCardTouchMove: React.TouchEventHandler<HTMLDivElement>;
  onCardTouchEnd: React.TouchEventHandler<HTMLDivElement>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  cardSize: string;
}) {
  // Share button state
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } else {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Keyboard navigation for playlist
  const playlistRef = useRef<HTMLUListElement | null>(null);
  function handlePlaylistKeyDown(e: React.KeyboardEvent) {
    if (!isActive || panel !== "listen") return;
    const current = currentTracks[0];
    const idx = project.tracks.findIndex((t) => t.src === current?.src);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = project.tracks[(idx + 1) % project.tracks.length];
      playTrack(project, next);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = project.tracks[(idx - 1 + project.tracks.length) % project.tracks.length];
      playTrack(project, prev);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      playTrack(project, project.tracks[idx]);
    }
  }

  return (
    <div
      className={clsx(
        "fantasy-card flex flex-col",
        cardSize,
        !isActive && "opacity-65 pointer-events-none select-none"
      )}
      style={{
        pointerEvents: isActive ? "auto" : "none",
        position: "relative",
        zIndex: 10,
        margin: 0,
        padding: 0,
      }}
      onTouchStart={onCardTouchStart}
      onTouchMove={onCardTouchMove}
      onTouchEnd={onCardTouchEnd}
    >
      {/* --- PNG overlay for 3D frame --- */}
      <Image
        src="/next/image/NewCardFrame.png" // <-- CHANGE to your PNG frame
        alt="Card frame"
        fill
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          zIndex: 20, pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
        priority
      />

      {/* --- NAV BUTTONS (top) --- */}
      <nav
        className="absolute flex gap-3 left-6 right-6 top-7 z-30"
        style={{
          justifyContent: "space-between",
        }}
        role="tablist"
      >
        {(["listen", "read", "about", "journal"] as const).map((tab) => (
          <button
            key={tab}
            tabIndex={0}
            role="tab"
            aria-selected={panel === tab}
            onClick={() => isActive && selectPanel(tab)}
            onKeyDown={(e) => {
              if (
                isActive &&
                (e.key === "Enter" || e.key === " ")
              ) {
                selectPanel(tab);
              }
            }}
            className={clsx(
              "fantasy-btn text-sm px-4 py-1 rounded-full",
              panel === tab && isActive && "fantasy-glow scale-110"
            )}
            disabled={!isActive}
            style={{
              background: "transparent",
            }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* --- CENTER IMAGE/ART --- */}
      <div
        className="absolute"
        style={{
          left: "14%",   // <-- Tweak these %
          top: "13%",
          width: "55%",  // <-- for your PNG window!
          height: "38%",
          zIndex: 30,
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "0 8px 42px 0 #e5c06c22",
          background: "#221d12",
        }}
      >
        {project.image && (
          <Image
            src={project.image}
            alt={project.title}
            fill
            style={{
              objectFit: "cover",
              borderRadius: 30,
              opacity: panel === "listen" && !panelOpen ? 1 : 0.2,
            }}
            draggable={false}
            priority
          />
        )}
      </div>

      {/* --- FLOATING BUTTONS (right, middle of image) --- */}
      {!panelOpen && isActive && (
        <div
          className="absolute flex flex-col gap-2"
          style={{
            right: "7%",
            top: "42%",
            zIndex: 40,
            transform: "translateY(-50%)",
          }}
        >
          <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} className="fantasy-btn p-1.5" type="button">
            {theme === "light" ? <Moon size={16} /> : <SUN3 size={16} />}
          </button>
          <button onClick={togglePlayPause} className="fantasy-btn p-1.5" type="button">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <a href="https://instagram.com/migu.exe" target="_blank" rel="noopener noreferrer" className="fantasy-btn p-1.5">
            <Instagram size={16} />
          </a>
          <button onClick={handleShare} className="fantasy-btn p-1.5 relative" type="button">
            <Share2 size={16} />
            <span
              className={clsx(
                "absolute left-10 top-1/2 -translate-y-1/2 bg-yellow-900 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50 transition-opacity duration-500",
                copied ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              style={{ transition: "opacity 0.5s" }}
            >
              Copied!
            </span>
          </button>
        </div>
      )}

      {/* --- TITLE --- */}
      <div
        className="absolute w-full text-center z-40"
        style={{
          top: "56%", // adjust to just under center window
          left: 0, right: 0,
          fontWeight: 700,
          fontSize: "1.15rem",
          color: "#e5c06c",
          textShadow: "0 2px 10px #241b10, 0 0px 5px #e5c06c22",
        }}
      >
        {project.title}
      </div>

      {/* --- PLAYLIST (BOTTOM BAR) --- */}
      <div
        className="absolute left-[9%] right-[9%] bottom-[8%] z-40"
        style={{
          background: "rgba(40,34,22,0.7)",
          borderRadius: 14,
          border: "1.5px solid #d4b96c66",
          padding: "0.5rem 0.9rem",
          minHeight: 56,
          boxShadow: "0 2px 12px 0 #c3a05a33",
        }}
      >
        {isActive && panel === "listen" && (
          <aside className="fantasy-playlist w-full">
            <ul
              className="space-y-1 w-full custom-scrollbar"
              style={{ maxHeight: 92, overflowY: "auto" }}
              ref={playlistRef}
              tabIndex={0}
              onKeyDown={handlePlaylistKeyDown}
            >
              {project.tracks.map((t) => (
                <li key={t.src}>
                  <button
                    type="button"
                    onClick={() => playTrack(project, t)}
                    aria-label={`Play ${t.title}`}
                    className={clsx(
                      "playlist-track px-2 py-1 rounded text-sm w-full text-left font-serif",
                      currentTracks[0]?.src === t.src
                        ? "font-semibold text-yellow-300 bg-yellow-900/20"
                        : "hover:bg-yellow-900/40 text-yellow-200"
                    )}
                    style={{
                      background: "none",
                      border: "none",
                    }}
                  >
                    <span>{t.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
      {/* --- Audio element for main card only --- */}
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
