"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Moon, Play, Pause, Instagram, Share2 } from "lucide-react";
import SUN3 from "@/components/icons/SUN3.svg";
import type { Project, Track, Panel } from "@/types";

type CardProps = {
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
};

export default function Card(props: CardProps) {
  // Destructure all props (optional, for readability)
  const {
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
  } = props;

  // Example internal state (for share feedback)
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Share handler
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

  // --- MINIMAL RENDER, you can expand from here ---
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
      <div className="p-8 w-full h-full flex flex-col items-center justify-center">
        <div className="mb-2 text-lg text-yellow-200">{project.title}</div>
        <div>
          <button onClick={togglePlayPause} className="mx-2">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={handleShare} className="mx-2">
            <Share2 size={20} />
            {copied && (
              <span className="ml-2 text-xs text-yellow-400">Copied!</span>
            )}
          </button>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} className="mx-2">
            {theme === "light" ? <Moon size={20} /> : <SUN3 size={20} />}
          </button>
        </div>
        <ul className="mt-6">
          {project.tracks.map((t: Track) => (
            <li key={t.src}>
              <button
                className={clsx(
                  "playlist-track px-2 py-1 rounded text-sm",
                  currentTracks[0]?.src === t.src
                    ? "font-semibold text-yellow-300"
                    : "text-yellow-200"
                )}
                onClick={() => playTrack(project, t)}
              >
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
