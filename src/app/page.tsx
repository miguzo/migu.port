"use client";

import { useState, useRef } from "react";
import Card, { Project, Track, Panel } from "@/components/Card";

// --- Your data, just like before
const projects: Project[] = [
  {
    id: "Les Fragments (2025)",
    title: "Les Fragments (2025)",
    image: "/next/image/FragmentsUp.png",
    readContent: "Description...",
    tracks: [
      { src: "/music/Fragments.mp3", title: "Lidge" },
      { src: "/music/DoubleCross.mp3", title: "Double Cross" },
      { src: "/music/Rabbit.mp3", title: "Rabbit" },
    ],
  },
  // ... other projects
];

export default function Home() {
  // --- State for current project/card UI, etc.
  const [projectIdx] = useState(0);

  const [currentTracks, setCurrentTracks] = useState<Track[]>(projects[0].tracks);
  const [panel, setPanel] = useState<Panel>("listen");
  const [panelOpen, setPanelOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- Handlers, just as before (shortened here for clarity)
  function playTrack(_proj: Project, t: Track) {
    setCurrentTracks([t, ...projects[projectIdx].tracks.filter((x) => x.src !== t.src)]);
  }
  function togglePlayPause() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setIsPlaying(true));
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }
  function selectPanel(next: Panel) {
    setPanel(next);
    setPanelOpen(next !== "listen");
  }
  // Swipe handlers and more, as needed

  // --- Card size, as before
  const cardSize = "max-w-[430px] w-[84vw] sm:w-[410px] md:w-[430px] h-[510px] sm:h-[570px] md:h-[620px]";
  const currentProject = projects[projectIdx];

  return (
    <main className="flex flex-col items-center min-h-screen justify-center bg-black">
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
        onCardTouchStart={() => {}}
        onCardTouchMove={() => {}}
        onCardTouchEnd={() => {}}
        audioRef={audioRef}
        cardSize={cardSize}
      />
    </main>
  );
}
