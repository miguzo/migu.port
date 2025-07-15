"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// BUTTON IMAGES
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
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Project (unused)
];
const bottomButton = {
  left: "24%",
  top: "76%",
  width: "52%",
  height: "8.7%",
};

// PROJECTS DATA (only one for now)
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
];

// All images and audio that need preloading
const getPreloadAssets = () => {
  const images = [
    projects[0].bg,
    "/next/image/NewCardFrameEmpty.png",
    ...projects[0].playlist.map((t) => t.titleImg),
    ...BUTTON_IMAGES.map((b) => b.on),
    ...BUTTON_IMAGES.map((b) => b.off),
  ];
  const audios = [
    ...projects[0].playlist.map((t) => t.src),
    "/sounds/Button.mp3",
  ];
  return { images, audios };
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAudioRef = useRef<HTMLAudioElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const [projectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // Preload logic (robust to missing files)
  useEffect(() => {
    let isMounted = true;
    const { images, audios } = getPreloadAssets();
    let loaded = 0;
    const total = images.length + audios.length;

    function checkDone() {
      loaded++;
      if (isMounted && loaded >= total) setIsLoaded(true);
    }

    images.forEach((src) => {
      const img = new window.Image();
      img.onload = checkDone;
      img.onerror = checkDone; // On error, also count as loaded!
      img.src = src;
    });

    audios.forEach((src) => {
      const audio = new window.Audio();
      audio.oncanplaythrough = checkDone;
      audio.onerror = checkDone; // On error, also count as loaded!
      audio.preload = "auto";
      audio.src = src;
    });

    // Set a fallback timeout in case something hangs
    const failSafe = setTimeout(() => {
      if (isMounted) setIsLoaded(true);
    }, 4000);

    return () => {
      isMounted = false;
      clearTimeout(failSafe);
    };
  }, []);

  // Button click sound
  function playButtonSound() {
    const audio = buttonAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  // Button handlers
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
    setPressedIdx(2);
    setTimeout(() => {
      goToNextTrack();
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

  // Update audio src on track change (do not autoplay)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = projects[projectIdx].playlist[trackIdx].src;
    audio.load();
  }, [projectIdx, trackIdx]);

  // Auto next when song ends
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

  // Render
  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  if (!isLoaded) {
    return (
      <main
        className="fixed inset-0 flex items-center justify-center bg-[#19191b]"
        style={{ minHeight: "100vh", minWidth: "100vw" }}
      >
        <span style={{ color: "#fff", fontSize: 24, fontFamily: "monospace" }}>
          Loading...
        </span>
      </main>
    );
  }

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
    </>
  );
}
