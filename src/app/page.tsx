"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// Map ON/OFF images for each button
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

// Playlist, each with song + background
const playlist = [
  { src: "/music/Fragments.mp3", bg: "/next/image/Fragments.png" },
  { src: "/music/Fragments.mp3", bg: "/next/image/Card2.png" },
  { src: "/music/Fragments.mp3", bg: "/next/image/Card3.png" },
];

// Button positions as before
const topButtonPositions = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Play
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Pause
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Restart
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Next
];
const bottomButton = {
  left: "24%",
  top: "76%",
  width: "52%",
  height: "8.7%",
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonAudioRef = useRef<HTMLAudioElement>(null);
  const [trackIdx, setTrackIdx] = useState(0);
  // 0: Play, 1: Pause, 2: Restart, 3: Next, null: none pressed
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // Play button click sound
  function playButtonSound() {
    const audio = buttonAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
  }

  // Audio Logic
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
  function handleRestart() {
    if (pressedIdx === 2) return;
    playButtonSound();
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPressedIdx(2); // Show Restart ON
    setTimeout(() => {
      setPressedIdx(0); // After 1s, Play ON
    }, 1000);
  }
  function handleNext() {
    playButtonSound();
    setPressedIdx(3); // Show Next ON
    setTimeout(() => {
      goToNextTrack();
      setPressedIdx(null); // After 1s, nothing ON
    }, 1000);
  }
  function goToNextTrack() {
    const nextIdx = (trackIdx + 1) % playlist.length;
    setTrackIdx(nextIdx);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  // When trackIdx changes, load new track (no autoplay after "Next")
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = playlist[trackIdx].src;
    audio.load();
    // Don't auto-play on track change, only when Play or Restart pressed
    // eslint-disable-next-line
  }, [trackIdx]);

  // Listen for end of track to go to next automatically (same logic as pressing "Next")
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPressedIdx(3);
      setTimeout(() => {
        goToNextTrack();
        setPressedIdx(null);
      }, 1000);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [trackIdx]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

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
          {/* --- Track-specific background --- */}
          <Image
            src={playlist[trackIdx].bg}
            alt="Track Background"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center 25%",
              transform: "scale(0.5)",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* --- Frame (empty, without buttons) --- */}
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

          {/* --- Render Button PNGs --- */}
          {BUTTON_IMAGES.map((img, idx) => (
            <Image
              key={idx}
              src={pressedIdx === idx ? img.on : img.off}
              alt={`Button ${idx + 1}`}
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 11, // above frame
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority={idx === 0}
            />
          ))}

          {/* --- Transparent Button Hotzones --- */}
          {/* Play */}
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
          {/* Pause */}
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
          {/* Restart */}
          <button
            aria-label="Restart"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 2 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleRestart}
            tabIndex={0}
          />
          {/* Next */}
          <button
            aria-label="Next"
            style={{
              ...topButtonPositions[3],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 3 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleNext}
            tabIndex={0}
          />

          {/* --- Bottom Button (no action yet) --- */}
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
            onClick={() => {
              playButtonSound();
              alert("Bottom Button clicked!");
            }}
            tabIndex={0}
          />

          {/* --- Hidden audio player (music) --- */}
          <audio ref={audioRef} hidden src={playlist[trackIdx].src} />
          {/* --- Hidden button sound effect --- */}
          <audio ref={buttonAudioRef} src="/sounds/Button.mp3" hidden />
        </div>
      </main>
    </>
  );
}
