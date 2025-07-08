"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  Moon, Sun, Play, Pause, ChevronLeft, ChevronRight, Instagram, Share2
} from "lucide-react";
import Image from "next/image";

// --- DATA ---

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

export default function Home() {
  const [projectIdx, setProjectIdx] = useState(0);
  const currentProject = projects[projectIdx];
  const [currentTracks, setCurrentTracks] = useState<Track[]>(currentProject.tracks);
  const [panel, setPanel] = useState<Panel>("listen");
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isPlaying, setIsPlaying] = useState(false);
  const [justSwiped, setJustSwiped] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextTrackRef = useRef<Track[]>(currentTracks);

  // Lock the entire page against scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehaviorX = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehaviorX = "";
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setCurrentTracks(projects[projectIdx].tracks);
  }, [projectIdx]);

  // Only autoplay when wasPlaying is true
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0;
    a.pause();
    a.currentTime = 0;
    a.src = currentTracks[0]?.src ?? "";
    a.load();
    if (wasPlaying) {
      a.play().catch(() => {});
    }
    const fadeInCleaner = fadeAudioIn(a);
    return () => {
      if (fadeInCleaner) fadeInCleaner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTracks]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  // --- Card/project carousel logic ---
  function nextProject() {
    if (justSwiped) return;
    setJustSwiped(true);
    setTimeout(() => setJustSwiped(false), 320);
    setWasPlaying(isPlaying);
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
    if (justSwiped) return;
    setJustSwiped(true);
    setTimeout(() => setJustSwiped(false), 320);
    setWasPlaying(isPlaying);
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
    setWasPlaying(isPlaying);
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
      a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }

  // --- Swiping logic (for card/project only, no panels) ---
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeEndX, setSwipeEndX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);
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
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) + 16) {
        if (dx < 0) nextProject();
        else prevProject();
      }
      setSwipeStartX(0);
      setSwipeEndX(0);
      setSwipeStartY(0);
    }
  };

  function getCard(idx: number) {
    const n = projects.length;
    if (idx < 0) return projects[(idx + n) % n];
    if (idx >= n) return projects[idx % n];
    return projects[idx];
  }

  const cardTransition = { type: "spring" as const, stiffness: 260, damping: 20 };
  const cardSize =
    "max-w-[430px] w-[96vw] sm:w-[410px] md:w-[430px] h-[510px] sm:h-[570px] md:h-[620px]";

  return (
    <main
      className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-zinc-900 overflow-hidden transition-colors"
      style={{
        WebkitTapHighlightColor: "transparent",
        touchAction: "pan-y",
        overscrollBehaviorX: "none",
      }}
      id="main"
    >
      <div
        className={clsx(
          "mt-8 relative w-full flex items-center justify-center",
          cardSize
        )}
      >
        {/* Arrows for desktop only */}
        {panel === "listen" && !panelOpen && (
          <>
            <button
              className={clsx(
                "hidden md:flex absolute left-[-56px] top-1/2 z-40 -translate-y-1/2 p-1.5 rounded-full shadow transition border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
              )}
              aria-label="Previous project"
              onClick={prevProject}
              tabIndex={0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={clsx(
                "hidden md:flex absolute right-[-56px] top-1/2 z-40 -translate-y-1/2 p-1.5 rounded-full shadow transition border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800/90 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700"
              )}
              aria-label="Next project"
              onClick={nextProject}
              tabIndex={0}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Carousel (three cards) */}
        <div
          className={clsx(
            "relative flex items-center justify-center",
            cardSize,
            "select-none"
          )}
          style={{ touchAction: "pan-y" }}
        >
          {/* Left side card */}
          <motion.div
            className={clsx("absolute top-0 left-0 w-[80%]")}
            style={{ pointerEvents: "none" }}
            animate={{
              scale: 0.85,
              opacity: 0.55,
              zIndex: 1,
              filter: "blur(1.5px)",
              x: -50,
            }}
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
              cardSize={cardSize}
            />
          </motion.div>
          {/* Center (active) card */}
          <motion.div
            className={clsx("relative mx-auto z-10", cardSize)}
            animate={{
              scale: 1,
              opacity: 1,
              zIndex: 10,
              filter: "none",
              x: 0,
            }}
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
              cardSize={cardSize}
            />

            {/* Panels overlay */}
            <AnimatePresence>
              {panelOpen && panel !== "listen" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 right-0 top-12 bottom-0 w-full h-full bg-white dark:bg-zinc-800/95 z-50 p-4 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col"
                  style={{ boxShadow: "0 16px 36px rgba(0,0,0,0.08)" }}
                  tabIndex={-1}
                  aria-modal="true"
                  role="dialog"
                >
                  {/* Panel header */}
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-black dark:text-white capitalize">
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
                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                          <path
                            d="M3.75 3.75l8.5 8.5M3.75 12.25l8.5-8.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Panel content */}
                  <div className="flex-1 text-sm text-gray-800 dark:text-gray-300 whitespace-pre-line">
                    {panel === "read" && <>{currentProject.readContent}</>}
                    {panel === "about" && (
                      <div>
                        About section here.
                        <a
                          href="https://mouvement.net/arts/octobre-numerique"
                          className="ml-1 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          mouvement.net/arts/octobre-numerique
                        </a>
                      </div>
                    )}
                    {panel === "journal" && <div>Journal section…</div>}
                  </div>
                  {/* Close handle for swipe down */}
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
            className={clsx("absolute top-0 right-0 w-[80%]")}
            style={{ pointerEvents: "none" }}
            animate={{
              scale: 0.85,
              opacity: 0.55,
              zIndex: 1,
              filter: "blur(1.5px)",
              x: 50,
            }}
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
              cardSize={cardSize}
            />
          </motion.div>
        </div>
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
  // --- Share button feedback ---
  const [copied, setCopied] = useState(false);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div
      className={clsx(
        "overflow-hidden transition-all shadow-xl rounded-2xl bg-white/95 dark:bg-zinc-800/90 backdrop-blur-md flex flex-col",
        cardSize,
        !isActive && "opacity-65 pointer-events-none select-none"
      )}
      style={{
        pointerEvents: isActive ? "auto" : "none",
      }}
      onTouchStart={onCardTouchStart}
      onTouchMove={onCardTouchMove}
      onTouchEnd={onCardTouchEnd}
    >
      {/* Top nav bar */}
      <nav className="h-12 bg-transparent flex items-center justify-center gap-1 px-2 rounded-t-2xl z-30 select-none" role="tablist">
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
              "text-md cursor-pointer bg-transparent border-none transition rounded focus:outline-none",
              panel === tab && isActive
                  ? "font-semibold text-black dark:text-white"
                  : "font-normal text-gray-400"
            )}
            style={{ padding: "0 0.4rem", minWidth: "auto" }}
            disabled={!isActive}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main image (taller) */}
      {project.image && (
        <div className="relative flex-1 flex items-center justify-center">
          <div className="w-[77%] mx-auto h-[60%] sm:h-[78%] relative">
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center",
                opacity: panel === "listen" && !panelOpen ? 1 : 0.17,
                borderRadius: 25,
              }}
              className="transition-opacity duration-300"
              priority
              sizes="(max-width: 600px) 80vw, 430px"
            />
            {/* Top overlay, fade effect */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-t from-transparent to-black/25 dark:to-zinc-900/50 pointer-events-none rounded-t-2xl" />
          </div>
        </div>
      )}

      {/* Bottom title and playlist, always at the bottom */}
      <div className="relative flex flex-col items-center justify-end w-full pb-5 pt-3 px-4 z-20" style={{ minHeight: 140 }}>
        {/* Title */}
        <h2 className="text-base font-semibold text-black dark:text-white text-center mb-1">
          {project.title}
        </h2>
        {/* Playlist (for active card, only in Listen) */}
        {isActive && panel === "listen" && (
          <aside className="w-full bg-white/90 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700 shadow rounded-xl">
            <ul className="space-y-1 px-1 py-1">
              {project.tracks.map((t, i) => (
                <li
                  key={i}
                  onClick={() => playTrack(project, t)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Play ${t.title}`}
                  className={clsx(
                    "playlist-track px-2 py-1 rounded transition cursor-pointer no-underline focus:outline-none text-sm",
                    currentTracks[0]?.src === t.src
                      ? "bg-gray-200 dark:bg-zinc-700 font-semibold text-black dark:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-700 text-black dark:text-white"
                  )}
                >
                  <span>{t.title}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
        {/* Space for "currently playing" (always occupies space) */}
        <div className="h-6 flex items-center justify-center w-full">
          {isActive && panel === "listen" && isPlaying && (
            <p className="text-xs text-gray-700 dark:text-gray-300 animate-fade-sine">
              Currently playing: <span className="font-semibold">{currentTracks[0]?.title}</span>
            </p>
          )}
        </div>
        {/* Floating controls */}
        {!panelOpen && isActive && (
         <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
            <button
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
              aria-label="Toggle theme"
              className="p-1.5 rounded-full shadow transition focus:outline-none bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-200"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="p-1.5 rounded-full shadow transition focus:outline-none bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-200"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <a
              href="https://instagram.com/migu.exe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-1.5 rounded-full shadow transition focus:outline-none bg-white/90 dark:bg-zinc-800/90 text-pink-500"
            >
              <Instagram size={16} />
            </a>
            <button
              onClick={handleShare}
              aria-label="Share"
              className="p-1.5 rounded-full shadow transition focus:outline-none bg-white/90 dark:bg-zinc-800/90 text-gray-700 dark:text-gray-200 relative"
            >
              <Share2 size={16} />
              <span
                className={clsx(
                  "absolute left-10 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50 transition-opacity duration-500",
                  copied ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                style={{
                  transition: "opacity 0.5s",
                }}
              >
                Copied!
              </span>
            </button>
          </div>
        )}
      </div>
      {/* Audio element for center card */}
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
