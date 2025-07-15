"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// BUTTON IMAGES (edit these if you change your filenames!)
const BUTTON_IMAGES = [
  {
    on: "/next/image/Button 1 ON.png",
    off: "/next/image/Button 1 Off.png",
  },
  {
    on: "/next/image/Button 2 ON.png",
    off: "/next/image/Button 2 Off.png",
  },
  {
    on: "/next/image/Button 3 ON.png",
    off: "/next/image/Button 3 Off.png",
  },
  {
    on: "/next/image/Button 4 On.png",
    off: "/next/image/Button 4 Off.png",
  },
];

// BUTTON ZONES
const topButtonPositions = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Play
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Pause
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Track
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Project
];
const bottomButton = {
  left: "24%",
  top: "76%",
  width: "52%",
  height: "8.7%",
};

// PROJECTS DATA (edit as needed)
const projects = [
  {
    bg: "/next/image/Fragments.png",
    playlist: [
      {
        src: "/music/1.Hunters.mp3",
        titleImg: "/next/image/1Hunters.png",
      },
      {
        src: "/music/2.Double Crossed.mp3",
        titleImg: "/next/image/2Doublecross.png",
      },
      {
        src: "/music/3.The Rabbit.mp3",
        titleImg: "/next/image/3Rabbit.png",
      },
    ],
  },
  {
    bg: "/next/image/OtherProjectBG.png",
    playlist: [
      {
        src: "/music/4.NewSong.mp3",
        titleImg: "/next/image/4NewSong.png",
      },
      {
        src: "/music/5.NextOne.mp3",
        titleImg: "/next/image/5NextOne.png",
      },
    ],
  },
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAudioRef = useRef<HTMLAudioElement>(null);

  // PROJECT & TRACK index
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);

  // pressedIdx: 0: Play, 1: Pause, 2: Next Track, 3: Next Project, null: none pressed
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // --- DEBUG LOGGING FOR iPHONE ---
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [preloaded, setPreloaded] = useState(false);

  // All assets to preload:
  const ALL_IMAGES = [
    ...BUTTON_IMAGES.flatMap(btn => [btn.on, btn.off]),
    "/next/image/Fragments.png",
    "/next/image/OtherProjectBG.png",
    "/next/image/1Hunters.png",
    "/next/image/2Doublecross.png",
    "/next/image/3Rabbit.png",
    "/next/image/4NewSong.png",
    "/next/image/5NextOne.png",
    "/next/image/NewCardFrameEmpty.png",
    // Add more if needed
  ];
  const ALL_AUDIO = [
    "/sounds/Button.mp3",
    "/music/1.Hunters.mp3",
    "/music/2.Double Crossed.mp3",
    "/music/3.The Rabbit.mp3",
    "/music/4.NewSong.mp3",
    "/music/5.NextOne.mp3",
  ];

  // Preload assets on mount
  useEffect(() => {
    let loaded = 0;
    const total = ALL_IMAGES.length + ALL_AUDIO.length;

    function log(msg: string) {
      setDebugLogs(prev => [...prev, msg]);
    }

    ALL_IMAGES.forEach(src => {
      const img = new window.Image();
      img.onload = () => {
        loaded++;
        log(`Loaded image: ${src} (${loaded}/${total})`);
        if (loaded >= total) setPreloaded(true);
      };
      img.onerror = () => {
        loaded++;
        log(`❌ Failed to load image: ${src} (${loaded}/${total})`);
        if (loaded >= total) setPreloaded(true);
      };
      img.src = src;
    });

    ALL_AUDIO.forEach(src => {
      const audio = new window.Audio(src);
      audio.oncanplaythrough = () => {
        loaded++;
        log(`Loaded audio: ${src} (${loaded}/${total})`);
        if (loaded >= total) setPreloaded(true);
      };
      audio.onerror = () => {
        loaded++;
        log(`❌ Failed to load audio: ${src} (${loaded}/${total})`);
        if (loaded >= total) setPreloaded(true);
      };
    });
  }, []);

  // ---- BUTTON SOUND ----
  function playButtonSound() {
    const audio = buttonAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // --- BUTTON HANDLERS ---
  function handlePlay() {
    if (pressedIdx === 0) return;
    playButtonSound();
    const audio = audioRef.current;
    if (!audio) return;
    audio.play();
    setPressedIdx(0);
  }
  function handlePause() {
    if (pressedIdx === 1) return;
    playButtonSound();
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPressedIdx(1);
  }
  function handleNextTrack() {
    playButtonSound();
    setPressedIdx(2); // Button 3 ON (momentary)
    setTimeout(() => {
      goToNextTrack();
      setPressedIdx(null);
    }, 1000);
  }
  function handleNextProject() {
    playButtonSound();
    setPressedIdx(3); // Button 4 ON (momentary)
    setTimeout(() => {
      const nextProject = (projectIdx + 1) % projects.length;
      setProjectIdx(nextProject);
      setTrackIdx(0);
      setPressedIdx(null);
    }, 1000);
  }
  function goToNextTrack() {
    const playlist = projects[projectIdx].playlist;
    const nextIdx = (trackIdx + 1) % playlist.length;
    setTrackIdx(nextIdx);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  // ---- Track or project changed: update audio, DO NOT AUTOPLAY
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = projects[projectIdx].playlist[trackIdx].src;
    audio.load();
  }, [projectIdx, trackIdx]);

  // ---- Auto next when song ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPressedIdx(2);
      setTimeout(() => {
        goToNextTrack();
        setPressedIdx(null);
      }, 1000);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [projectIdx, trackIdx]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  // --- RENDER ---
  return (
    <>
      {/* DEBUG LOG WINDOW FOR iPHONE */}
      {!preloaded && (
        <pre
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            maxHeight: 160,
            zIndex: 9999,
            background: "#19191be0",
            color: "#ffe082",
            fontSize: 11,
            overflow: "auto",
            pointerEvents: "auto",
            margin: 0,
          }}
        >
          {debugLogs.join("\n") || "Loading..."}
        </pre>
      )}

      <Head>
        <title>Victor Clavelly</title>
      </Head>
      {/* Hide rest of site while not preloaded */}
      {!preloaded ? null : (
        <main
          className="fixed inset-0 flex justify-center bg-[#19191b]"
          style={{ minHeight: "100vh", minWidth: "100vw" }}
        >
          <div
            style={{
              position: "relative",
              width: "min(98vw, 430px)",
              height: "min(85vh, calc(98vw * 1.44), 620px)",
              maxHeight: "620px",
              marginTop: "1vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* --- PROJECT BACKGROUND IMAGE --- */}
            <Image
              src={project.bg}
              alt="Project Background"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center 25%",
                transform: "scale(0.5)",
                zIndex: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority
            />

            {/* --- FRAME (empty, without buttons) --- */}
            <Image
              src="/next/image/NewCardFrameEmpty.png"
              alt="Main Visual Frame"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                background: "transparent",
                zIndex: 2,
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority
              sizes="(max-width: 600px) 98vw, 430px"
            />

            {/* --- TITLE IMAGE (always shown, on top of frame) --- */}
            <Image
              src={currentTrack.titleImg}
              alt="Song Title"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 15,
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority
            />

            {/* --- BUTTON PNGS --- */}
            {BUTTON_IMAGES.map((img, idx) => (
              <Image
                key={idx}
                src={pressedIdx === idx ? img.on : img.off}
                alt={`Button ${idx + 1}`}
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  zIndex: 11,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                priority={idx === 0}
              />
            ))}

            {/* --- TRANSPARENT BUTTON HOTZONES --- */}
            <button
              aria-label="Play"
              style={{
                ...topButtonPositions[0],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pressedIdx === 0 ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handlePlay}
              tabIndex={0}
            />
            <button
              aria-label="Pause"
              style={{
                ...topButtonPositions[1],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pressedIdx === 1 ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handlePause}
              tabIndex={0}
            />
            <button
              aria-label="Next Track"
              style={{
                ...topButtonPositions[2],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pressedIdx === 2 ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handleNextTrack}
              tabIndex={0}
            />
            <button
              aria-label="Next Project"
              style={{
                ...topButtonPositions[3],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pressedIdx === 3 ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handleNextProject}
              tabIndex={0}
            />

            {/* --- Bottom Button (optional) --- */}
            <button
              aria-label="Bottom Button"
              style={{
                ...bottomButton,
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                zIndex: 20,
              }}
              onClick={() => alert("Bottom Button clicked!")}
              tabIndex={0}
            />

            {/* --- Hidden audio player for music --- */}
            <audio ref={audioRef} hidden src={currentTrack.src} />
            {/* --- Hidden audio player for button click --- */}
            <audio ref={buttonAudioRef} hidden src="/sounds/Button.mp3" preload="auto" />
          </div>
        </main>
      )}
    </>
  );
}
