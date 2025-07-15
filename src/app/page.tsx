"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// BUTTON IMAGES
const BUTTON_IMAGES = [
  { on: "/next/image/Button 1 ON.png", off: "/next/image/Button 1 Off.png" },
  { on: "/next/image/Button 2 ON.png", off: "/next/image/Button 2 Off.png" },
  { on: "/next/image/Button 3 ON.png", off: "/next/image/Button 3 Off.png" },
  { on: "/next/image/Button 4 On.png", off: "/next/image/Button 4 Off.png" },
];

// BUTTON ZONES
const topButtonPositions = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },
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
    bg: "/next/image/Fragments.png",
    playlist: [
      { src: "/music/1.Hunters.mp3", titleImg: "/next/image/1Hunters.png" },
      { src: "/music/2.Double Crossed.mp3", titleImg: "/next/image/2Doublecross.png" },
      { src: "/music/3.The Rabbit.mp3", titleImg: "/next/image/3Rabbit.png" },
    ],
  },
  {
    bg: "/next/image/OtherProjectBG.png",
    playlist: [
      { src: "/music/4.NewSong.mp3", titleImg: "/next/image/4NewSong.png" },
      { src: "/music/5.NextOne.mp3", titleImg: "/next/image/5NextOne.png" },
    ],
  },
];

const BUTTON_SOUND = "/sounds/Button.mp3";
const ALL_IMAGES = [
  ...BUTTON_IMAGES.flatMap(img => [img.on, img.off]),
  ...projects.flatMap(project => [
    project.bg,
    ...project.playlist.map(song => song.titleImg),
  ]),
  "/next/image/NewCardFrameEmpty.png",
];

const ALL_AUDIO = [
  ...projects.flatMap(project => project.playlist.map(song => song.src)),
  BUTTON_SOUND,
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAudioRef = useRef<HTMLAudioElement>(null);

  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // PRELOAD state: is everything ready?
  const [preloaded, setPreloaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // ---- PRELOAD everything ----
useEffect(() => {
  let loaded = 0;
  // Preload images
  ALL_IMAGES.forEach(src => {
    const img = new window.Image();
    img.onload = () => {
      loaded++;
      if (loaded >= ALL_IMAGES.length + ALL_AUDIO.length) setPreloaded(true);
    };
    img.onerror = () => {
      loaded++;
      if (loaded >= ALL_IMAGES.length + ALL_AUDIO.length) setPreloaded(true);
    };
    img.src = src;
  });

  // Preload audio: fetch all, load into Audio objects
  ALL_AUDIO.forEach(src => {
    const audio = new window.Audio(src);
    audio.oncanplaythrough = () => {
      loaded++;
      if (loaded >= ALL_IMAGES.length + ALL_AUDIO.length) setPreloaded(true);
    };
    audio.onerror = () => {
      loaded++;
      if (loaded >= ALL_IMAGES.length + ALL_AUDIO.length) setPreloaded(true);
    };
  });
  // eslint-disable-next-line
}, []);

  // ---- UNLOCK AUDIO (first tap) ----
  function unlockAllAudio() {
    // "Touch" each audio to unlock on iOS/Android (do this muted)
    ALL_AUDIO.forEach(src => {
      const a = new window.Audio(src);
      a.muted = true;
      a.play().catch(() => {});
      setTimeout(() => { a.pause(); a.currentTime = 0; }, 100);
    });
    // Also unlock our refs
    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current.play().catch(() => {});
      setTimeout(() => { audioRef.current!.pause(); audioRef.current!.currentTime = 0; audioRef.current!.muted = false; }, 100);
    }
    if (buttonAudioRef.current) {
      buttonAudioRef.current.muted = true;
      buttonAudioRef.current.play().catch(() => {});
      setTimeout(() => { buttonAudioRef.current!.pause(); buttonAudioRef.current!.currentTime = 0; buttonAudioRef.current!.muted = false; }, 100);
    }
    setUserInteracted(true);
  }

  // ---- BUTTON SOUND ----
  function playButtonSound() {
    const audio = buttonAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // --- BUTTON HANDLERS ---
  function handlePlay() {
    if (pressedIdx === 0) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play();
    setPressedIdx(0);
  }
  function handlePause() {
    if (pressedIdx === 1) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPressedIdx(1);
  }
  function handleNextTrack() {
    setPressedIdx(2);
    setTimeout(() => {
      goToNextTrack();
      setPressedIdx(null);
    }, 1000);
  }
  function handleNextProject() {
    setPressedIdx(3);
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

  // --- RENDER ---
  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  // ----- PRELOADER -----
  if (!preloaded || !userInteracted) {
    return (
      <main
        className="fixed inset-0 flex items-center justify-center bg-black z-[9999]"
        style={{ minHeight: "100vh", minWidth: "100vw" }}
        onClick={() => preloaded && !userInteracted && unlockAllAudio()}
        onTouchStart={() => preloaded && !userInteracted && unlockAllAudio()}
      >
        {/* Replace below with your logo or animation! */}
        <div style={{ color: "#e5c06c", fontFamily: "Cinzel, serif", fontSize: 32 }}>
          {preloaded ? "Touch to Start" : "Loading..."}
        </div>
      </main>
    );
  }

  // ----- MAIN APP -----
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
            onClick={() => { playButtonSound(); handlePlay(); }}
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
            onClick={() => { playButtonSound(); handlePause(); }}
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
            onClick={() => { playButtonSound(); handleNextTrack(); }}
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
            onClick={() => { playButtonSound(); handleNextProject(); }}
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
            onClick={() => { playButtonSound(); alert("Bottom Button clicked!"); }}
            tabIndex={0}
          />

          {/* --- Hidden audio player for music --- */}
          <audio ref={audioRef} hidden src={currentTrack.src} />
          {/* --- Hidden audio player for button click --- */}
          <audio ref={buttonAudioRef} hidden src={BUTTON_SOUND} preload="auto" />
        </div>
      </main>
    </>
  );
}
