"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  Moon, Play, Pause, ChevronLeft, ChevronRight, Instagram, Share2
} from "lucide-react";
import SUN3 from "@/components/icons/SUN3.svg";

// --- DATA TYPES AND DATA ---
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
    image: "/next/image/FragmentsUp.png",
    readContent: `For his debut, Victor Clavelly unveiled Les Fragments. The collection is suspended between medieval myth and digital vision. Sculptural garments, first modeled in 3D and then finished by hand, evoke both armor and artifact, hovering between protection and skin. The soundtrack echoed this balance. Classical strings and piano faded into electronic layers, evolving with each look.`,
    tracks: [
      { src: "/music/Fragments.mp3", title: "Lidge" },
      { src: "/music/DoubleCross.mp3", title: "Double Cross" },
      { src: "/music/Rabbit.mp3", title: "Rabbit" },
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
      { src: "/music/track10.mp3", title: "Extra Track" },
      { src: "/music/track11.mp3", title: "Another Track" },
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

let fadeInterval: NodeJS.Timeout | null = null;

function fadeAudioOut(audio: HTMLAudioElement, onDone: () => void) {
  if (fadeInterval) clearInterval(fadeInterval);
  if (!audio) return onDone();
  let fading = true;
  fadeInterval = setInterval(() => {
    if (!fading) return clearInterval(fadeInterval!);
    if (audio.volume > 0.08) {
      audio.volume = Math.max(0, audio.volume - 0.08);
    } else {
      audio.volume = 0;
      clearInterval(fadeInterval!);
      fading = false;
      onDone();
    }
  }, 25);
  return () => {
    fading = false;
    if (fadeInterval) clearInterval(fadeInterval);
  };
}

function fadeAudioIn(audio: HTMLAudioElement) {
  if (fadeInterval) clearInterval(fadeInterval);
  if (!audio) return;
  let v = 0;
  audio.volume = 0;
  fadeInterval = setInterval(() => {
    if (!audio) return clearInterval(fadeInterval!);
    if (v < 0.94) {
      v += 0.08;
      audio.volume = Math.min(1, v);
    } else {
      audio.volume = 1;
      clearInterval(fadeInterval!);
    }
  }, 25);
  return () => {
    if (fadeInterval) clearInterval(fadeInterval);
  };
}

export default function Home() {
  const [projectIdx, setProjectIdx] = useState(0);
  const [currentTracks, setCurrentTracks] = useState<Track[]>(projects[0].tracks);
  const [panel, setPanel] = useState<Panel>("listen");
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const [justSwiped, setJustSwiped] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextTrackRef = useRef<Track[]>(currentTracks);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehaviorX = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehaviorX = "";
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

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
    if (wasPlaying) {
      a.play().catch(() => {});
    }
    const fadeInCleaner = fadeAudioIn(a);
    return () => {
      if (fadeInCleaner) fadeInCleaner();
    };
  }, [currentTracks, wasPlaying]);

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

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (panel === "listen" && !panelOpen) {
        if (e.key === "ArrowRight") nextProject();
        if (e.key === "ArrowLeft") prevProject();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panel, panelOpen, justSwiped, isPlaying]);

  const actuallySwitchProject = useCallback((dir: 1 | -1) => {
    setProjectIdx((i) => (i + dir + projects.length) % projects.length);
    setPanel("listen");
    setPanelOpen(false);
  }, []);

  // Allow card change anytime, even while playing
  const canChangeProject = !justSwiped && panel === "listen" && !panelOpen;

  const nextProject = useCallback(() => {
    if (!canChangeProject) return;
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
  }, [canChangeProject, isPlaying, actuallySwitchProject]);

  const prevProject = useCallback(() => {
    if (!canChangeProject) return;
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
  }, [canChangeProject, isPlaying, actuallySwitchProject]);

  function selectPanel(next: Panel) {
    setPanel(next);
    setPanelOpen(next !== "listen");
  }
  function playTrack(_proj: Project, t: Track) {
    if (currentTracks[0]?.src === t.src) return;
    const a = audioRef.current;
    nextTrackRef.current = [t, ...projects[projectIdx].tracks.filter((x) => x.src !== t.src)];
    setWasPlaying(isPlaying);
    if (a && !a.paused && a.volume > 0) {
      fadeAudioOut(a, () => {
        a.pause();
        a.volume = 1;
        setCurrentTracks(nextTrackRef.current);
      });
    } else {
      setCurrentTracks([t, ...projects[projectIdx].tracks.filter((x) => x.src !== t.src)]);
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

  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeEndX, setSwipeEndX] = useState(0);
  const [swipeStartY, setSwipeStartY] = useState(0);

  const onCardTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (canChangeProject) {
      setSwipeStartX(e.touches[0].clientX);
      setSwipeStartY(e.touches[0].clientY);
      setSwipeEndX(e.touches[0].clientX);
    }
  };
  const onCardTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (canChangeProject) setSwipeEndX(e.touches[0].clientX);
  };
  const onCardTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (canChangeProject) {
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
  const cardSize = "max-w-[430px] w-[84vw] sm:w-[410px] md:w-[430px] h-[510px] sm:h-[570px] md:h-[620px]";

  const currentProject = projects[projectIdx];

  // --- Custom scrollbar style ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #e5c06c #19191b;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 9px;
        background: #19191b;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #e5c06c, #a8852c);
        border-radius: 10px;
        border: 2px solid #19191b;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Victor Clavelly | Music & Projects</title>
        <meta name="description" content="Music, interactive projects and collections by Victor Clavelly." />
        <meta property="og:title" content="Victor Clavelly | Music & Projects" />
        <meta property="og:description" content="Music, interactive projects and collections by Victor Clavelly." />
        <meta property="og:image" content="/next/image/FragmentsUp.png" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main
        className="flex flex-col items-center min-h-screen overflow-hidden transition-colors"
        style={{
          background: "#19191b url('https://www.transparenttextures.com/patterns/dark-fish-skin.png') repeat",
          fontFamily: "'Cinzel', serif",
          WebkitTapHighlightColor: "transparent",
          touchAction: "pan-y",
          overscrollBehaviorX: "none",
        }}
        id="main"
      >
        <div className={clsx("mt-8 relative w-full flex items-center justify-center", cardSize)}>
          {panel === "listen" && !panelOpen && (
            <>
              <button
                className="hidden md:flex fantasy-btn absolute left-[-56px] top-1/2 z-40 -translate-y-1/2 p-1.5"
                aria-label="Previous project"
                onClick={prevProject}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="hidden md:flex fantasy-btn absolute right-[-56px] top-1/2 z-40 -translate-y-1/2 p-1.5"
                aria-label="Next project"
                onClick={nextProject}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          <div
            className={clsx("relative flex items-center justify-center", cardSize, "select-none")}
            style={{ touchAction: "pan-y" }}
          >
            <motion.div
              className={clsx("absolute top-0 left-0 w-[80%]")}
              style={{ pointerEvents: "none" }}
              animate={{ scale: 0.85, opacity: 0.55, zIndex: 1, filter: "blur(1.5px)", x: -50 }}
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
            <motion.div
              className={clsx("relative mx-auto z-10", cardSize)}
              animate={{ scale: 1, opacity: 1, zIndex: 10, filter: "none", x: 0 }}
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

              <AnimatePresence>
                {panelOpen && panel !== "listen" && (
                  <PanelOverlay
                    panel={panel}
                    currentProject={currentProject}
                    theme={theme}
                    setTheme={setTheme}
                    isPlaying={isPlaying}
                    togglePlayPause={togglePlayPause}
                    setPanelOpen={setPanelOpen}
                    setPanel={setPanel}
                  />
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div
              className={clsx("absolute top-0 right-0 w-[80%]")}
              style={{ pointerEvents: "none" }}
              animate={{ scale: 0.85, opacity: 0.55, zIndex: 1, filter: "blur(1.5px)", x: 50 }}
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
    </>
  );
}

function PanelOverlay({
  panel,
  currentProject,
  theme,
  setTheme,
  isPlaying,
  togglePlayPause,
  setPanelOpen,
  setPanel,
}: {
  panel: Panel;
  currentProject: Project;
  theme: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  isPlaying: boolean;
  togglePlayPause: () => void;
  setPanelOpen: (v: boolean) => void;
  setPanel: (p: Panel) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.5 }}
      transition={{ duration: 0.16 }}
      className="fantasy-panel absolute left-0 right-0 top-12 w-full h-[calc(100%-3rem)] z-50 p-4 pt-7 flex flex-col"
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold fantasy-glow capitalize text-yellow-300">
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
            className="fantasy-btn p-1.5"
          >
            {theme === "light" ? <Moon size={15} /> : <SUN3 size={15} />}
          </button>
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="fantasy-btn p-1.5"
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={() => {
              setPanelOpen(false);
              setPanel("listen");
            }}
            aria-label="Close panel"
            className="fantasy-btn p-1.5 ml-1"
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
      <div className="flex-1 text-sm text-yellow-200/90 whitespace-pre-line mt-3 font-serif">
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
      <div
        className="absolute left-0 bottom-0 w-full h-6 flex items-center justify-center cursor-pointer z-40"
        onClick={() => {
          setPanelOpen(false);
          setPanel("listen");
        }}
        role="button"
        aria-label="Close panel"
      >
        <span className="w-10 h-1 bg-yellow-600 rounded-full" />
      </div>
    </motion.div>
  );
}

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
      {/* --- Background image layer --- */}
      <div
        className="absolute inset-0 w-full h-full z-0 rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: `url('/next/image/BackGroundFrag.png')`,
          opacity: 0.16,
        }}
        aria-hidden="true"
      />

      {/* --- Nav Tabs --- */}
   <nav
  className="h-12 flex items-center justify-center gap-1 px-2 rounded-t-2xl z-30 select-none"
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
        "fantasy-btn text-sm px-3 py-1 mx-1 font-serif border-2",
        panel === tab
          ? "bg-yellow-300 text-[#19191b] border-yellow-400 font-bold shadow-yellow-400/40 shadow-lg"
          : "bg-transparent text-yellow-100 border-yellow-400 hover:bg-yellow-700/30 hover:text-yellow-300",
        "focus-visible:ring-2 focus-visible:ring-yellow-400/80"
      )}
      disabled={!isActive}
      type="button"
    >
      {tab[0].toUpperCase() + tab.slice(1)}
    </button>
  ))}
</nav>

      {/* --- Main Image + Floating Controls --- */}
      {project.image && (
        <div className="relative flex-1 flex items-center justify-center">
          <div
            className="w-[64vw] max-w-[330px] sm:w-[77%] sm:max-w-[unset] mx-auto h-[62vw] sm:h-[78%] relative"
            style={{
              boxShadow: "0 8px 42px 0 #e5c06c44",
              borderRadius: "25px",
            }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center",
                opacity: panel === "listen" && !panelOpen ? 1 : 0.17,
                borderRadius: 25,
                border: "none",
                boxShadow: "0 8px 42px 0 #e5c06c2a",
              }}
              className="transition-opacity duration-300"
              priority
              sizes="(max-width: 600px) 80vw, 430px"
            />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-t from-transparent to-yellow-900/20 pointer-events-none rounded-t-2xl" />
            {/* --- FLOATING CONTROLS --- */}
            {!panelOpen && isActive && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
                <button
                  onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                  aria-label="Toggle theme"
                  className="fantasy-btn p-1.5"
                  type="button"
                >
                  {theme === "light" ? <Moon size={16} /> : <SUN3 size={16} />}
                </button>
                <button
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="fantasy-btn p-1.5"
                  type="button"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <a
                  href="https://instagram.com/migu.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="fantasy-btn p-1.5"
                >
                  <Instagram size={16} />
                </a>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="fantasy-btn p-1.5 relative"
                  type="button"
                >
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
          </div>
        </div>
      )}

      {/* --- Title, Currently Playing, Playlist --- */}
      <div className="relative flex flex-col items-center w-full pb-5 pt-0 px-4 z-20" style={{ minHeight: 140 }}>
        {/* Title */}
        <h2 className="fantasy-title text-center mb-1 mt-0 text-yellow-300">{project.title}</h2>
        {/* Currently Playing */}
        <div className="h-6 flex items-center justify-center w-full mb-1">
          {isActive && panel === "listen" && isPlaying && (
            <p className="text-xs fantasy-glow animate-fade-sine text-yellow-300">
              Currently playing: <span className="font-semibold text-yellow-300">{currentTracks[0]?.title}</span>
            </p>
          )}
        </div>
        {/* Playlist (with custom scrollbar) */}
        <div className="w-full mt-auto">
          {isActive && panel === "listen" && (
            <aside className="fantasy-playlist w-full">
              <ul
                className="space-y-1 px-1 py-1 max-h-[96px] overflow-y-auto custom-scrollbar"
                ref={playlistRef}
                tabIndex={0}
                onKeyDown={handlePlaylistKeyDown}
                style={{
                  minHeight: 50,
                  background: "rgba(25, 25, 27, 0.7)",
                  borderRadius: "8px",
                  border: "1px solid #a8852c",
                }}
              >
                {project.tracks.map((t) => (
                  <li key={t.src}>
                    <button
                      type="button"
                      onClick={() => playTrack(project, t)}
                      aria-label={`Play ${t.title}`}
                      className={clsx(
                        "playlist-track px-2 py-1 rounded transition cursor-pointer no-underline focus:outline-none text-sm w-full text-left font-serif",
                        currentTracks[0]?.src === t.src
                          ? "fantasy-track-active font-semibold text-yellow-300"
                          : "hover:bg-yellow-900/40 text-yellow-200"
                      )}
                    >
                      <span>{t.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
      {/* Audio element for center card only */}
      {isActive && <audio ref={audioRef} hidden />}
    </div>
  );
}
