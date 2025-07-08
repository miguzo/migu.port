"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Moon, Sun, Play, Pause, ChevronLeft, ChevronRight, Instagram, Share2 } from "lucide-react";
import Image from "next/image";
import { FastAverageColor } from "fast-average-color";

// --- Types and data ---
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
    image: "/next/image/Fragments.png",
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
    image: "/next/image/Card2.png",
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
    image: "/next/image/Card3.png",
    readContent: `Aggragate project description…`,
    tracks: [
      { src: "/music/track7.mp3", title: "Melted Reel" },
      { src: "/music/track8.mp3", title: "Rewind Fade" },
      { src: "/music/track9.mp3", title: "Flutter Dust" },
    ],
  },
];

type Panel = "listen" | "read" | "about" | "journal";

// --- Utility: fade audio in/out ---
function fadeAudioOut(audio: HTMLAudioElement, onDone: () => void) {
  if (!audio) return onDone();
  let fading = true;
  const fade = setInterval(() => {
    if (!fading) return clearInterval(fade);
    if (audio.volume > 0.08) {
      audio.volume = Math.max(0, audio.volume - 0.08);
    } else {
      audio.volume = 0;
      clearInterval(fade);
      fading = false;
      onDone();
    }
  }, 25);
  return () => {
    fading = false;
    clearInterval(fade);
  };
}
function fadeAudioIn(audio: HTMLAudioElement) {
  if (!audio) return;
  let v = 0;
  audio.volume = 0;
  const fade = setInterval(() => {
    if (!audio) return clearInterval(fade);
    if (v < 0.94) {
      v += 0.08;
      audio.volume = Math.min(1, v);
    } else {
      audio.volume = 1;
      clearInterval(fade);
    }
  }, 25);
  return () => clearInterval(fade);
}

// --- Main Page ---
export default function Home() {
  const [projectIdx, setProjectIdx] = useState(0);
  const currentProject = projects[projectIdx];
  const [currentTracks, setCurrentTracks] = useState<Track[]>(currentProject.tracks);
  const [panel, setPanel] = useState<Panel>("listen");
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Swipe state for card/project change
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeEndX, setSwipeEndX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);
  const nextTrackRef = useRef<Track[]>(currentTracks);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : "";
  }, [panelOpen]);

  useEffect(() => {
    setCurrentTracks(projects[projectIdx].tracks);
  }, [projectIdx]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0;
    a.pause();
    a.currentTime = 0;
    a.src = currentTracks[0]?.src ?? "";
    a.load();
    a.play().catch(() => {});
    const fadeInCleaner = fadeAudioIn(a);
    return () => {
      if (fadeInCleaner) fadeInCleaner();
    };
  }, [currentTracks]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, []);

  // --- Card/project carousel logic ---
  function nextProject() {
    const a = audioRef.current;
    if (a && !a.paused && a.volume > 0) {
      fadeAudioOut(a, () => {
        a.pause();
        a.volume = 1;
        actuallySwitchProject(1);
      });
    } else {
      actuallySwitchProject(1);
    }
  }
  function prevProject() {
    const a = audioRef.current;
    if (a && !a.paused && a.volume > 0) {
      fadeAudioOut(a, () => {
        a.pause();
        a.volume = 1;
        actuallySwitchProject(-1);
      });
    } else {
      actuallySwitchProject(-1);
    }
  }
  function actuallySwitchProject(dir: 1 | -1) {
    setProjectIdx((i) => (i + dir + projects.length) % projects.length);
    setPanel("listen");
    setPanelOpen(false);
  }

  // --- Panel and section logic ---
  function selectPanel(next: Panel) {
    if (next === "listen") {
      setPanel("listen");
      setPanelOpen(false);
    } else {
      if (!panelOpen) setPanelOpen(true);
      setPanel(next);
    }
  }
  function playTrack(_proj: Project, t: Track) {
    if (currentTracks[0]?.src === t.src) return;
    const a = audioRef.current;
    nextTrackRef.current = [t, ...currentProject.tracks.filter((x) => x.src !== t.src)];
    if (a && !a.paused && a.volume > 0) {
      fadeAudioOut(a, () => {
        a.pause();
        a.volume = 1;
        setCurrentTracks(nextTrackRef.current);
      });
    } else {
      setCurrentTracks([t, ...currentProject.tracks.filter((x) => x.src !== t.src)]);
    }
  }
  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }

  // --- Swiping logic (for card/project only, no panels) ---
  const onCardTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (panel === "listen" && !panelOpen) {
      setSwipeStartX(e.touches[0].clientX);
      setSwipeStartY(e.touches[0].clientY);
      setSwipeEndX(e.touches[0].clientX);
    }
  };
  const onCardTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (panel === "listen" && !panelOpen) setSwipeEndX(e.touches[0].clientX);
  };
  const onCardTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (panel === "listen" && !panelOpen) {
      const dx = swipeEndX - swipeStartX;
      const dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextProject();
        else prevProject();
      }
      setSwipeStartX(0);
      setSwipeEndX(0);
      setSwipeStartY(0);
    }
  };

  // --- Partial card carousel logic ---
  function getCard(idx: number) {
    const n = projects.length;
    if (idx < 0) return projects[(idx + n) % n];
    if (idx >= n) return projects[idx % n];
    return projects[idx];
  }

  // --- Animations ---
  const centerCard = {
    scale: 1,
    opacity: 1,
    zIndex: 10,
    filter: "none",
    boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
    x: 0,
  };
  const sideCard = (side: "left" | "right") => ({
    scale: 0.8,
    opacity: 0.55,
    zIndex: 1,
    filter: "blur(1.5px)",
    boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
    x: side === "left" ? -56 : 56,
  });
  const cardTransition = { type: "spring" as const, stiffness: 260, damping: 20 };

  // --- Card/panel height (always fixed) ---
  const CARD_HEIGHT = 430; // adjust as you want!

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 transition-colors">
      <div className="flex justify-center items-center w-full relative" style={{ minHeight: CARD_HEIGHT + 40 }}>
        {/* Arrows outside the card */}
        <button
          className="hidden sm:flex items-center justify-center absolute -left-20 top-1/2 -translate-y-1/2 z-40
            p-2 rounded-full shadow transition border"
          style={{
            background: "#191a1e",
            color: "#ededed",
            borderColor: "#ededed",
          }}
          aria-label="Previous project"
          onClick={prevProject}
          tabIndex={0}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="relative w-full max-w-md" style={{ height: CARD_HEIGHT }}>
          {/* Carousel with three cards (peek sides) */}
          <div className="relative flex items-center justify-center select-none w-full h-full">
            {/* Left side card */}
            <motion.div
              className="absolute top-0 left-0 w-[84%] mx-auto"
              style={{ pointerEvents: "none" }}
              animate={sideCard("left")}
              transition={cardTransition}
              key={"left-" + projectIdx}
            >
              <Card
                project={getCard(projectIdx - 1)}
                isActive={false}
                panel={panel}
                panelOpen={panelOpen}
                playTrack={playTrack}
                currentTracks={currentTracks}
                isPlaying={isPlaying}
                theme={theme}
                togglePlayPause={togglePlayPause}
                setTheme={setTheme}
                selectPanel={selectPanel}
                onCardTouchStart={() => {}}
                onCardTouchMove={() => {}}
                onCardTouchEnd={() => {}}
                audioRef={audioRef}
                cardHeight={CARD_HEIGHT}
              />
            </motion.div>
            {/* Center (active) card */}
            <motion.div
              className="relative w-full mx-auto z-10"
              animate={centerCard}
              transition={cardTransition}
              onTouchStart={onCardTouchStart}
              onTouchMove={onCardTouchMove}
              onTouchEnd={onCardTouchEnd}
              key={currentProject.id}
            >
              <Card
                project={currentProject}
                isActive={true}
                panel={panel}
                panelOpen={panelOpen}
                playTrack={playTrack}
                currentTracks={currentTracks}
                isPlaying={isPlaying}
                theme={theme}
                togglePlayPause={togglePlayPause}
                setTheme={setTheme}
                selectPanel={selectPanel}
                onCardTouchStart={onCardTouchStart}
                onCardTouchMove={onCardTouchMove}
                onCardTouchEnd={onCardTouchEnd}
                audioRef={audioRef}
                cardHeight={CARD_HEIGHT}
              />

              {/* Panels overlay */}
              <AnimatePresence>
                {panelOpen && panel !== "listen" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 right-0 top-12 bottom-0 w-full bg-white dark:bg-zinc-800/95 z-50 p-4 overflow-y-auto rounded-b-2xl backdrop-blur-md shadow-2xl"
                    style={{ minHeight: CARD_HEIGHT - 48, height: CARD_HEIGHT - 48 }}
                    tabIndex={-1}
                    aria-modal="true"
                    role="dialog"
                  >
                    {/* Panel header */}
                    <div className="flex items-center justify-between mb-2">
                      <h2 className={clsx(
                        "text-lg font-bold capitalize",
                        theme === "dark" ? "text-white" : "text-black"
                      )}>
                        {panel === "read"
                          ? currentProject.title
                          : panel === "about"
                          ? "About"
                          : "Journal"}
                      </h2>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                          aria-label="Toggle theme"
                          className="p-1.5 bg-white dark:bg-zinc-700 rounded-full shadow text-gray-600 dark:text-white focus:outline-none"
                          tabIndex={0}
                        >
                          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                        </button>
                        <button
                          onClick={togglePlayPause}
                          aria-label={isPlaying ? "Pause" : "Play"}
                          className="p-1.5 bg-white dark:bg-zinc-700 rounded-full shadow text-gray-600 dark:text-white focus:outline-none"
                          tabIndex={0}
                        >
                          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                        </button>
                        <button
                          onClick={() => {
                            setPanelOpen(false);
                            setPanel("listen");
                          }}
                          aria-label="Close panel"
                          className="p-1.5 bg-white dark:bg-zinc-700 rounded-full shadow text-gray-600 dark:text-white focus:outline-none ml-1"
                          tabIndex={0}
                        >
                          <span className="sr-only">Close</span>
                          <svg width="13" height="13" viewBox="0 0 14 14" stroke="currentColor" fill="none">
                            <path d="M2 2l10 10m0-10L2 12" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Panel content */}
                    {panel === "read" && (
                      <p className={clsx(
                        "mt-1 leading-relaxed text-[15px]",
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      )}>
                        {currentProject.readContent}
                      </p>
                    )}
                    {panel === "about" && (
                      <div className={clsx(
                        "leading-relaxed space-y-3 text-[15px]",
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      )}>
                        <div>
                          Welcome! I&apos;m Igor Dubreucq, a freelance sound artist and composer.
                          I create immersive audio experiences and experimental music projects.
                          This site showcases my recent works, explorations, and ongoing collaborations.
                        </div>
                        <div>
                          I&apos;m looking forward to work on new projects, so feel free to reach out at{" "}
                          <a
                            href="mailto:igordubreucq.pro@gmail.com"
                            className="underline hover:opacity-70 focus:outline-none"
                          >
                            igordubreucq.pro@gmail.com
                          </a>{" "}
                          if you have any questions or ideas.
                        </div>
                      </div>
                    )}
                    {panel === "journal" && (
                      <div className={clsx(
                        "leading-relaxed text-[15px]",
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      )}>
                        What happened and what&apos;s to come?
                        <br /><br />
                        <a
                          href="https://www.mouvement.net/arts/octobre-numerique-a-arles-faire-monde-quand-tout-est-k-o?"
                          className="underline hover:opacity-70 focus:outline-none"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          mouvement.net/arts/octobre-numerique
                        </a>
                      </div>
                    )}
                    {/* Close handle */}
                    <div
                      className="absolute left-0 bottom-0 w-full h-6 flex items-center justify-center cursor-pointer z-40"
                      onClick={() => {
                        setPanelOpen(false);
                        setPanel("listen");
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Close panel"
                    >
                      <span className="w-10 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Right side card */}
            <motion.div
              className="absolute top-0 right-0 w-[84%] mx-auto"
              style={{ pointerEvents: "none" }}
              animate={sideCard("right")}
              transition={cardTransition}
              key={"right-" + projectIdx}
            >
              <Card
                project={getCard(projectIdx + 1)}
                isActive={false}
                panel={panel}
                panelOpen={panelOpen}
                playTrack={playTrack}
                currentTracks={currentTracks}
                isPlaying={isPlaying}
                theme={theme}
                togglePlayPause={togglePlayPause}
                setTheme={setTheme}
                selectPanel={selectPanel}
                onCardTouchStart={() => {}}
                onCardTouchMove={() => {}}
                onCardTouchEnd={() => {}}
                audioRef={audioRef}
                cardHeight={CARD_HEIGHT}
              />
            </motion.div>
          </div>
        </div>
        <button
          className="hidden sm:flex items-center justify-center absolute -right-20 top-1/2 -translate-y-1/2 z-40
            p-2 rounded-full shadow transition border"
          style={{
            background: "#191a1e",
            color: "#ededed",
            borderColor: "#ededed",
          }}
          aria-label="Next project"
          onClick={nextProject}
          tabIndex={0}
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </main>
  );
}

// --- Card component ---
function Card({
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
  cardHeight,
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
  cardHeight: number;
}) {
  // --- Dominant color palette ---
  const [palette, setPalette] = useState<{ bg: string; text: string; accent: string }>({
    bg: theme === "dark" ? "#181825" : "#f8f8f8",
    text: theme === "dark" ? "#f8f8f8" : "#222",
    accent: theme === "dark" ? "#ededed" : "#282828"
  });

  useEffect(() => {
    if (!project.image || !isActive) return;
    const fac = new FastAverageColor();
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.src = project.image;
    img.onload = () => {
      const color = fac.getColor(img);
      const bg = color.hex;
      // Luminance for text
    //  const luminance = (color.value[0] * 0.299 + color.value[1] * 0.587 + color.value[2] * 0.114) / 255;
     // const text = luminance > 0.55 ? "#1b1b1b" : "#fafafa";
      // Accent: neutral readable grey
      setPalette({
        bg,
        text: theme === "dark" ? "#f8f8f8" : "#222",
        accent: theme === "dark" ? "#ededed" : "#282828"
      });
    };
    img.onerror = () => {
      setPalette({
        bg: theme === "dark" ? "#181825" : "#f8f8f8",
        text: theme === "dark" ? "#f8f8f8" : "#222",
        accent: theme === "dark" ? "#ededed" : "#282828"
      });
    };
    // eslint-disable-next-line
  }, [project.image, isActive, theme]);

  // --- Share/Instagram controls ---
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <div
      className={clsx(
        "overflow-hidden pb-4 transition-all relative backdrop-blur-md rounded-2xl shadow-xl"
      )}
      style={{
        pointerEvents: isActive ? "auto" : "none",
        minHeight: cardHeight,
        height: cardHeight,
        background: !panelOpen && panel === "listen" && project.image
          ? undefined
          : palette.bg,
        color: palette.text,
      }}
      onTouchStart={onCardTouchStart}
      onTouchMove={onCardTouchMove}
      onTouchEnd={onCardTouchEnd}
    >
      {/* Image as full bg when Listen is open */}
      {(!panelOpen && panel === "listen" && project.image) && (
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          className="object-cover w-full h-full absolute inset-0 z-0"
          style={{
            filter: "brightness(0.8) saturate(1.1)",
            borderRadius: "1rem"
          }}
        />
      )}
      {/* Optional gradient overlay for readability */}
      {(!panelOpen && panel === "listen" && project.image) && (
        <div className="absolute inset-0 rounded-2xl z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top,rgba(30,30,40,0.7) 70%,transparent 100%)"
          }}
        />
      )}

      {/* Top nav bar */}
      <nav
        className={clsx(
          "h-12 flex items-center justify-center gap-1 px-2 rounded-t-2xl z-30 select-none relative",
          theme === "dark" ? "bg-zinc-900 text-white" : "bg-white text-black"
        )}
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
              "text-md cursor-pointer bg-transparent border-none transition rounded focus:outline-none z-20",
              panel === tab && isActive
                ? "font-semibold"
                : "font-normal opacity-70"
            )}
            style={{ padding: "0 0.3rem", minWidth: "auto" }}
            disabled={!isActive}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Floating controls */}
      {!panelOpen && isActive && (
        <div className="fixed right-3 top-20 flex flex-col gap-2 z-40">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Toggle theme"
            className="p-1.5 rounded-full shadow transition focus:outline-none"
            style={{
              background: palette.text,
              color: palette.bg,
              border: "1.5px solid " + palette.accent
            }}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="p-1.5 rounded-full shadow transition focus:outline-none"
            style={{
              background: palette.text,
              color: palette.bg,
              border: "1.5px solid " + palette.accent
            }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          {/* Instagram */}
          <a
            href="https://instagram.com/YOUR_INSTAGRAM_HERE"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-1.5 rounded-full shadow transition focus:outline-none flex items-center justify-center"
            style={{
              background: "#fff",
              color: "#d72689",
              border: "1.5px solid #d72689"
            }}
          >
            <Instagram size={16} />
          </a>
          {/* Share */}
          <button
            onClick={handleShare}
            aria-label="Share"
            className="p-1.5 rounded-full shadow transition focus:outline-none"
            style={{
              background: palette.text,
              color: palette.bg,
              border: "1.5px solid " + palette.accent
            }}
          >
            <Share2 size={16} />
          </button>
          {/* Copied feedback */}
          {copied && (
            <span className="absolute right-0 top-12 bg-black text-white px-3 py-1 rounded shadow text-xs z-50 animate-fade-in-out"
              style={{
                opacity: 0.92,
                pointerEvents: "none",
                whiteSpace: "nowrap"
              }}>
              Copied!
            </span>
          )}
        </div>
      )}

      {/* Main content, playlist etc */}
      <div
        className={clsx(
          "p-3 flex flex-col items-center space-y-3 transition-opacity duration-500 relative z-20"
        )}
        style={{
          color: palette.text
        }}
      >
        {/* If not Listen, or not showing image bg, fallback to inline image */}
        {(panelOpen || panel !== "listen" || !project.image) && (
          <div className="relative w-full flex items-center justify-center">
            {project.image && (
              <Image
                src={project.image}
                alt={project.title}
                width={170}
                height={170}
                className="w-[60%] max-w-[170px] aspect-square object-cover rounded-xl shadow"
                style={{ marginTop: 6, marginBottom: 6 }}
                priority
              />
            )}
          </div>
        )}
        <h2
          className={clsx(
            "text-base font-semibold text-center",
            theme === "dark" ? "text-white" : "text-black"
          )}
          style={{ color: palette.text }}
        >
          {project.title}
        </h2>
        {/* --- Reserved currently playing line (always takes space) --- */}
        <p
          className={clsx(
            "text-xs min-h-[1.25rem] h-5 transition-opacity duration-300 text-center w-full",
            isActive && isPlaying ? "opacity-100" : "opacity-0"
          )}
          style={{ color: palette.text, height: "1.25rem", lineHeight: "1.25rem" }}
        >
          {isActive && isPlaying ? (
            <>Currently playing: <span className="font-semibold">{currentTracks[0]?.title}</span></>
          ) : (
            <>&nbsp;</>
          )}
        </p>
        {/* Playlist (only for active card) */}
        {isActive && (
          <aside className={clsx(
            "w-full p-2 bg-white/30 dark:bg-zinc-800/80 border border-gray-400 dark:border-zinc-700 shadow rounded-xl overflow-y-auto max-h-[33vh]",
            theme === "dark" ? "text-gray-100" : "text-gray-800"
          )}>
            <ul className="space-y-1 px-1">
              {project.tracks.map((t, i) => (
                <li
                  key={i}
                  onClick={() => playTrack(project, t)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Play ${t.title}`}
                  className={clsx(
                    "playlist-track px-2 py-1 rounded-full shadow-sm transition cursor-pointer bg-transparent no-underline focus:outline-none text-sm",
                    currentTracks[0]?.src === t.src
                      ? "font-semibold"
                      : "hover:opacity-80"
                  )}
                  style={{
                    background: currentTracks[0]?.src === t.src ? palette.accent : "transparent",
                    color: currentTracks[0]?.src === t.src ? palette.bg : palette.text,
                  }}
                >
                  <span>{t.title}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
      {/* Audio element for center card */}
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
