"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// BUTTON IMAGES: each index for each button (play, pause, next track, next project)
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

// PROJECTS DATA
const projects = [
  {
    bg: "/next/image/Fragments.png", // Shared background for this project
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
    bg: "/next/image/OtherProjectBG.png", // Next project's background
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
  // Add more projects if you want!
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAudioRef = useRef<HTMLAudioElement>(null);

  // PROJECT & TRACK index
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);

  // pressedIdx: 0: Play, 1: Pause, 2: Next Track, 3: Next Project, null: none pressed
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // ---- BUTTON SOUND ----
  function playButtonSound() {
    const audio = buttonAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
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
      // Next project
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
    // Don't autoplay after switching track/project
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

  // --- RENDER ---
  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
      </Head>
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

          {/* --- RENDER BUTTON PNGs --- */}
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
          <audio ref={buttonAudioRef} hidden src="/music/Button.mp3" />
        </div>
      </main>
    </>
  );
}
