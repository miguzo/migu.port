"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// Each song has an audio src and a bg image
const playlist = [
  {
    src: "/music/Fragments.mp3",
    bg: "/next/image/Fragments.png",
  },
  {
    src: "/music/Fragments.mp3",
    bg: "/next/image/Card2.png",
  },
  {
    src: "/music/Fragments.mp3",
    bg: "/next/image/Card3.png",
  },
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [playerState, setPlayerState] = useState<"play" | "pause" | "restart" | null>("pause");

  // Handlers
  function handlePlay() {
    if (playerState === "play") return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play();
    setPlayerState("play");
  }
  function handlePause() {
    if (playerState === "pause") return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlayerState("pause");
  }
  function handleRestart() {
    if (playerState === "restart") return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlayerState("play");
  }
  function handleNext() {
    goToNextTrack();
  }
  function goToNextTrack() {
    const nextIdx = (trackIdx + 1) % playlist.length;
    setTrackIdx(nextIdx);
    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = playlist[nextIdx].src;
      audio.currentTime = 0;
      audio.play();
      setPlayerState("play");
    }, 0);
  }

  // When trackIdx changes, load new track (but don't auto-play unless Next/Play is pressed)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = playlist[trackIdx].src;
    audio.load();
    if (playerState === "play") {
      audio.play();
    }
    // eslint-disable-next-line
  }, [trackIdx]);

  // Listen for end of track to go to next automatically
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => goToNextTrack();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
    // eslint-disable-next-line
  }, [trackIdx]);

  // Style for "pressed" buttons (for demo)
  const pressedStyle = {
    outline: "2px solid #e5c06c",
    filter: "brightness(1.2)",
    boxShadow: "0 0 12px #e5c06cbb",
  };

  // Button positions
  const topButtonPositions = [
    { left: "18.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Play
    { left: "34.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Pause
    { left: "51%", top: "11%", width: "14.7%", height: "4.9%" },   // Restart
    { left: "67.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Next
  ];
  const bottomButton = {
    left: "22.9%",
    top: "78.4%",
    width: "53.3%",
    height: "8.2%",
  };

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

          {/* --- Frame PNG on top --- */}
          <Image
            src="/next/image/NewCardFrame.png"
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

          {/* --- Top Buttons --- */}
          <button
            aria-label="Play"
            style={{
              ...topButtonPositions[0],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: playerState === "play" ? "default" : "pointer",
              zIndex: 10,
              ...(playerState === "play" ? pressedStyle : {}),
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
              cursor: playerState === "pause" ? "default" : "pointer",
              zIndex: 10,
              ...(playerState === "pause" ? pressedStyle : {}),
            }}
            onClick={handlePause}
            tabIndex={0}
          />
          <button
            aria-label="Restart"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
              ...(playerState === "restart" ? pressedStyle : {}),
            }}
            onClick={handleRestart}
            tabIndex={0}
          />
          <button
            aria-label="Next"
            style={{
              ...topButtonPositions[3],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
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
              zIndex: 10,
            }}
            onClick={() => alert("Bottom Button clicked!")}
            tabIndex={0}
          />

          {/* --- Hidden audio player --- */}
          <audio ref={audioRef} hidden src={playlist[trackIdx].src} />
        </div>
      </main>
    </>
  );
}
