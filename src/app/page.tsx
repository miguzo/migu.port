"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Moon, Sun, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [swipeStartX, setSwipeStartX] = useState(0);
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
      if (fadeInCleaner) {
        fadeInCleaner();
      }
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

  // --- Carousel Logic: Looping, with audio fade-out on change ---
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
  // *** CRITICAL: use updater function so projectIdx is always fresh ***
  function actuallySwitchProject(dir: 1 | -1) {
    setProjectIdx(prevIdx => {
      const nextIdx = (prevIdx + dir + projects.length) % projects.length;
      setCurrentTracks(projects[nextIdx].tracks);
      setPanel("listen");
      setPanelOpen(false);
      return nextIdx;
    });
  }

  // --- Panel and section logic ---
  function handleSectionArrow(dir: 1 | -1) {
    const tabs: Panel[] = ["listen", "read", "about", "journal"];
    const idx = tabs.indexOf(panel);
    const next = tabs[(idx + dir + tabs.length) % tabs.length];
    selectPanel(next);
  }
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

  // --- Swiping logic ---
  // Only store swipeStartX, swipeStartY; use event values for dx/dy
  const onCardTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (panel === "listen" && !panelOpen) {
      setSwipeStartX(e.touches[0].clientX);
      setSwipeStartY(e.touches[0].clientY);
    }
  };
  const onCardTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (panel === "listen" && !panelOpen) {
      const dx = e.changedTouches[0].clientX - swipeStartX;
      const dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleSectionArrow(1);
        else handleSectionArrow(-1);
      }
    }
  };
  // Swiping for panel (for left/right navigation while open)
  const onPanelTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    setSwipeStartX(e.touches[0].clientX);
    setSwipeStartY(e.touches[0].clientY);
  };
  const onPanelTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) handleSectionArrow(1);
      else handleSectionArrow(-1);
    } else if (panelOpen && dy > 40 && Math.abs(dy) > Math.abs(dx)) {
      setPanelOpen(false);
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

  return (
    <main
      className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-zinc-900 overflow-y-auto overflow-x-hidden transition-colors"
      style={{
        WebkitTapHighlightColor: "transparent",
        touchAction: "pan-y",
        overscrollBehaviorX: "none",
      }}
    >
      <div
        className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 relative w-full max-w-sm sm:max-w-md flex items-center justify-center"
        style={{
          minHeight: 450,
          minWidth: 220,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* Carousel controls */}
        {panel === "listen" && !panelOpen && (
          <>
            <button
              className={clsx(
                "absolute left-1 top-1/2 z-40 -translate-y-1/2 p-1.5 rounded-full shadow transition border border-gray-300 dark:border-yellow-300",
                theme === "dark"
                  ? "bg-zinc-800/90 text-yellow-200 hover:bg-yellow-300/20"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              )}
              aria-label="Previous project"
              onClick={prevProject}
              tabIndex={0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={clsx(
                "absolute right-1 top-1/2 z-40 -translate-y-1/2 p-1.5 rounded-full shadow transition border border-gray-300 dark:border-yellow-300",
                theme === "dark"
                  ? "bg-zinc-800/90 text-yellow-200 hover:bg-yellow-300/20"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              )}
              aria-label="Next project"
              onClick={nextProject}
              tabIndex={0}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Carousel with three cards (peek sides) */}
        <div
          className="relative flex items-center justify-center h-[370px] select-none w-full"
          style={{
            touchAction: "pan-y",
          }}
        >
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
            />
          </motion.div>
          {/* Center (active) card */}
          <motion.div
            className="relative w-[93%] mx-auto z-10"
            animate={centerCard}
            transition={cardTransition}
            onTouchStart={onCardTouchStart}
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
              onCardTouchMove={() => {}}
              onCardTouchEnd={onCardTouchEnd}
              audioRef={audioRef}
            />

            {/* Panels overlay */}
            <AnimatePresence>
              {panelOpen && panel !== "listen" && (
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 26 }}
                  className="absolute left-0 right-0 top-12 bottom-0 w-full bg-white dark:bg-zinc-800/95 z-50 p-4 overflow-y-auto rounded-b-2xl backdrop-blur-md shadow-2xl"
                  style={{ boxShadow: "0 16px 36px rgba(0,0,0,0.08)" }}
                  onTouchStart={onPanelTouchStart}
                  onTouchEnd={onPanelTouchEnd}
                  tabIndex={0}
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
                        onClick={() => setPanelOpen(false)}
                        aria-label="Close panel"
                        className="p-1.5 bg-white dark:bg-zinc-700 rounded-full shadow text-gray-600 dark:text-white focus:outline-none ml-1"
                        tabIndex={0}
                      >
                        <span className="sr-only">Close</span>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 14 14"
                          stroke="currentColor"
                          fill="none"
                        >
                          <path d="M2 2l10 10m0-10L2 12" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Panel content */}
                  {panel === "read" && (
                    <p className="mt-1 text-gray-600 dark:text-gray-100 leading-relaxed text-[15px]">
                      {currentProject.readContent}
                    </p>
                  )}
                  {panel === "about" && (
                    <div className="text-gray-700 dark:text-gray-100 leading-relaxed space-y-3 text-[15px]">
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
                    <div className="text-gray-700 dark:text-gray-100 leading-relaxed text-[15px]">
                      What happened and what&apos;s to come?
                      <br />
                      <br />
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
                  {/* Close handle (swipe or click) */}
                  <div
                    className="absolute left-0 bottom-0 w-full h-6 flex items-center justify-center cursor-pointer z-40"
                    onClick={() => setPanelOpen(false)}
                    onTouchStart={(e) => setSwipeStartY(e.touches[0].clientY)}
                    onTouchEnd={(e) => {
                      const deltaY = e.changedTouches[0].clientY - swipeStartY;
                      if (deltaY > 40) setPanelOpen(false);
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
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// --- Card component (reusable for side/center) ---
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
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden pb-4 transition-all",
        isActive
          ? "border-2" +
              (theme === "dark" ? " border-yellow-300" : " border-gray-300")
          : "",
        !isActive && "opacity-80",
        "bg-white/95 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl shadow-xl"
      )}
      style={{
        pointerEvents: isActive ? "auto" : "none",
        minHeight: 320,
      }}
      onTouchStart={onCardTouchStart}
      onTouchEnd={onCardTouchEnd}
    >
      {/* Top nav bar */}
      <nav
        className="h-12 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-center gap-1 px-2 rounded-t-2xl z-30 select-none"
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
              "text-md cursor-pointer bg-transparent border-none transition rounded focus:outline-none",
              panel === tab && isActive
                ? "font-semibold text-black dark:text-white"
                : "font-normal text-gray-400"
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
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label="Toggle theme"
            className="p-1.5 rounded-full shadow transition focus:outline-none"
            style={
              theme === "dark"
                ? { background: "#f9f6e9", color: "#3d2d0d" }
                : { background: "#1a1a1a", color: "#fbe877" }
            }
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="p-1.5 rounded-full shadow transition focus:outline-none"
            style={
              theme === "dark"
                ? { background: "#f9f6e9", color: "#3d2d0d" }
                : { background: "#1a1a1a", color: "#fbe877" }
            }
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      )}

      {/* Listen (main view, image, playlist) */}
      <div
        className={clsx(
          "p-3 flex flex-col items-center space-y-3 transition-opacity duration-500",
          panelOpen && panel !== "listen" && "opacity-40 pointer-events-none select-none"
        )}
      >
        {project.image && (
          <div className="relative w-full flex items-center justify-center">
            <Image
              src={project.image}
              alt={project.title}
              width={170}
              height={170}
              className="w-[60%] max-w-[170px] aspect-square object-cover rounded-xl shadow"
              style={{ marginTop: 6, marginBottom: 6 }}
              priority
            />
          </div>
        )}
        <h2 className="text-base font-semibold text-black dark:text-white text-center">
          {project.title}
        </h2>
        {isActive && isPlaying && (
          <p className="text-xs text-gray-700 dark:text-gray-300 animate-fade-sine">
            Currently playing: <span className="font-semibold">{currentTracks[0]?.title}</span>
          </p>
        )}
        {/* Playlist (only for active card) */}
        {isActive && (
          <aside className="w-full p-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow rounded-xl overflow-y-auto max-h-[33vh]">
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
      </div>
      {/* Audio element for center card */}
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
