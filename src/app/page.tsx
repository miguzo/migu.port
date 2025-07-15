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

// Button image paths (use your exported files here!)
const buttonImgs = [
  {
    off: "/next/image/Button 1 Off.png",
    on: "/next/image/Button 1 ON.png",
  },
  {
    off: "/next/image/Button 2 Off.png",
    on: "/next/image/Button 2 ON.png",
  },
  {
    off: "/next/image/Button 3 Off.png",
    on: "/next/image/Button 3 ON.png",
  },
  {
    off: "/next/image/Button 4 Off.png",
    on: "/next/image/Button 4 On.png",
  },
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const restartTimeout = useRef<NodeJS.Timeout | null>(null);
  const nextTimeout = useRef<NodeJS.Timeout | null>(null);

  const [trackIdx, setTrackIdx] = useState(0);

  // "null" = none pressed; 0 = Play, 1 = Pause, 2 = Restart, 3 = Next
  const [pressed, setPressed] = useState<null | 0 | 1 | 2 | 3>(null);

  // --- Button Logic ---

  function handlePlay() {
    if (pressed === 0) return;
    setPressed(0);
    const audio = audioRef.current;
    if (!audio) return;
    audio.play();
  }
  function handlePause() {
    if (pressed === 1) return;
    setPressed(1);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }
  function handleRestart() {
    // Momentarily ON for 1s then OFF (not latched)
    setPressed(2);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    if (restartTimeout.current) clearTimeout(restartTimeout.current);
    restartTimeout.current = setTimeout(() => {
      setPressed(null);
    }, 1000);
  }
  function handleNext() {
    // Momentarily ON for 1s then OFF (not latched)
    setPressed(3);
    goToNextTrack();
    if (nextTimeout.current) clearTimeout(nextTimeout.current);
    nextTimeout.current = setTimeout(() => {
      setPressed(null);
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
      setPressed(0); // Play ON after next track
    }, 0);
  }

  // When trackIdx changes, load new track (but only play if Play or Next)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = playlist[trackIdx].src;
    audio.load();
    if (pressed === 0 || pressed === 3) {
      audio.play();
      setPressed(0); // Set Play ON after Next
    }
    // eslint-disable-next-line
  }, [trackIdx]);

  // Listen for end of track to go to next automatically
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => handleNext();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
    // eslint-disable-next-line
  }, [trackIdx]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (restartTimeout.current) clearTimeout(restartTimeout.current);
      if (nextTimeout.current) clearTimeout(nextTimeout.current);
    };
  }, []);

  // --- Button positions ---
  const topButtonPositions = [
    { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },   // Play
    { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },   // Pause
    { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },   // Restart
    { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },   // Next
  ];
  const bottomButton = {
    left: "24%",
    top: "76%",
    width: "52%",
    height: "8.7%",
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

          {/* --- Top Buttons images (off/on) */}
          {topButtonPositions.map((btn, i) => (
            <Image
              key={i}
              src={pressed === i ? buttonImgs[i].on : buttonImgs[i].off}
              alt={`Button ${i + 1}`}
              fill
              style={{
                position: "absolute",
                left: btn.left,
                top: btn.top,
                width: btn.width,
                height: btn.height,
                objectFit: "contain",
                zIndex: 5,
                pointerEvents: "none", // image itself is not clickable, only invisible button below
                userSelect: "none",
              }}
            />
          ))}

          {/* --- Top invisible buttons */}
          <button
            aria-label="Play"
            style={{
              ...topButtonPositions[0],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressed === 0 ? "default" : "pointer",
              zIndex: 10,
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
              cursor: pressed === 1 ? "default" : "pointer",
              zIndex: 10,
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
