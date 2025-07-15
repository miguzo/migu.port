"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// Song list
const playlist = [
  { src: "/music/Fragments.mp3", bg: "/next/image/Fragments.png" },
  { src: "/music/Fragments.mp3", bg: "/next/image/Card2.png" },
  { src: "/music/Fragments.mp3", bg: "/next/image/Card3.png" },
];

// PNG assets
const buttonPng = [
  {
    off: "/Button 1 Off.png",
    on: "/Button 1 ON.png",
  },
  {
    off: "/Button 2 Off.png",
    on: "/Button 2 ON.png",
  },
  {
    off: "/Button 3 Off.png",
    on: "/Button 3 ON.png",
  },
  {
    off: "/Button 4 Off.png",
    on: "/Button 4 On.png",
  },
];

// Button positions (must match PNG renders)
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
  const [trackIdx, setTrackIdx] = useState(0);
  // null = nothing pressed, 0=play, 1=pause, 2=restart, 3=next
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  // Handles
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
  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPressedIdx(2);
    // Unpush after 1s (momentary action)
    setTimeout(() => {
      // Only unpush if it's still on this button (user hasn't pressed another)
      setPressedIdx(null);
    }, 1000);
  }
  function handleNext() {
    goToNextTrack();
    setPressedIdx(3);
    setTimeout(() => {
      setPressedIdx(null);
    }, 1000);
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
      setPressedIdx(0); // Play is pressed after next
    }, 0);
  }

  // When trackIdx changes, load new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = playlist[trackIdx].src;
    audio.load();
    // If "play" was active before, play new
    if (pressedIdx === 0) {
      audio.play();
    }
  }, [trackIdx]);

  // When song ends, go next
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => handleNext();
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
          {/* --- Track background --- */}
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

          {/* --- Empty frame --- */}
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

          {/* --- Render each button image by state --- */}
          {topButtonPositions.map((btn, idx) => (
            <Image
              key={idx}
              src={pressedIdx === idx ? buttonPng[idx].on : buttonPng[idx].off}
              alt={`Button ${idx + 1}`}
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                pointerEvents: "none",
                userSelect: "none",
                zIndex: 3,
              }}
              // Optionally, for perf: only show visible buttons
              priority={pressedIdx === idx}
              // Un-comment the next line if you see wrong layering:
              // style={{ ...btn, zIndex: 3, pointerEvents: "none", userSelect: "none", position: "absolute" }}
            />
          ))}

          {/* --- Invisible click zones (overlay) --- */}
          {/* PLAY */}
          <button
            aria-label="Play"
            style={{
              ...topButtonPositions[0],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 0 ? "default" : "pointer",
              zIndex: 10,
            }}
            onClick={handlePlay}
            tabIndex={0}
          />
          {/* PAUSE */}
          <button
            aria-label="Pause"
            style={{
              ...topButtonPositions[1],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 1 ? "default" : "pointer",
              zIndex: 10,
            }}
            onClick={handlePause}
            tabIndex={0}
          />
          {/* RESTART */}
          <button
            aria-label="Restart"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handleRestart}
            tabIndex={0}
          />
          {/* NEXT */}
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
