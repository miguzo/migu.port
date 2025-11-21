"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function HomeMenu() {
  const router = useRouter();

  const [hovered, setHovered] = useState<null | "player" | "cv">(null);

  const [hasEntered, setHasEntered] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // ✔ WebAudio refs
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientBuffer = useRef<AudioBuffer | null>(null);
  const ambientSource = useRef<AudioBufferSourceNode | null>(null);
  const lowpassFilter = useRef<BiquadFilterNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);

  // ⭐ FADE OUT before changing pages
  const fadeOut = (to: string) => {
    const overlay = document.getElementById("transition-overlay");
    if (!overlay) return;

    overlay.style.pointerEvents = "auto";
    overlay.style.opacity = "1";

    setTimeout(() => router.push(to), 600);
  };

  // ⭐ Check if already entered
  useEffect(() => {
    const already = localStorage.getItem("entered");
    if (already === "true") {
      setHasEntered(true);
    }
  }, []);

  // ⭐ Load hover sound
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
    hoverSound.current.volume = 1;
  }, []);

  // ⭐ Init audio & preload ambient
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtx.current = ctx;

    lowpassFilter.current = ctx.createBiquadFilter();
    lowpassFilter.current.type = "lowpass";
    lowpassFilter.current.frequency.value = 20000;

    volumeGain.current = ctx.createGain();
    volumeGain.current.gain.value = 0;

    fetch("/sounds/Ambient.mp3")
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((decoded) => {
        ambientBuffer.current = decoded;
        setAudioReady(true);
      });
  }, []);

  // ⭐ Start ambient
  const startAmbientSound = () => {
    if (
      !audioCtx.current ||
      !ambientBuffer.current ||
      ambientStarted.current ||
      !lowpassFilter.current ||
      !volumeGain.current
    )
      return;

    const ctx = audioCtx.current;

    const source = ctx.createBufferSource();
    source.buffer = ambientBuffer.current;
    source.loop = true;

    source.connect(lowpassFilter.current);
    lowpassFilter.current.connect(volumeGain.current);
    volumeGain.current.connect(ctx.destination);

    volumeGain.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);

    source.start();
    ambientSource.current = source;
    ambientStarted.current = true;
  };

  // ⭐ Correct ENTER handler
  const handleEnter = async () => {
    if (!audioReady) return;

    if (audioCtx.current?.state === "suspended") {
      await audioCtx.current.resume();
    }

    startAmbientSound();

    // Fade out global overlay now
    const overlay = document.getElementById("transition-overlay");
    if (overlay) overlay.style.opacity = "0";

    setHasEntered(true);
    localStorage.setItem("entered", "true");
  };

  // HOVER effects
  const playHoverSound = () => {
    if (!hoverSound.current) return;
    hoverSound.current.currentTime = 0;
    hoverSound.current.play();
  };

  const applyLowpass = () => {
    if (!audioCtx.current || !lowpassFilter.current) return;
    lowpassFilter.current.frequency.linearRampToValueAtTime(
      300,
      audioCtx.current.currentTime + 0.2
    );
  };

  const removeLowpass = () => {
    if (!audioCtx.current || !lowpassFilter.current) return;
    lowpassFilter.current.frequency.linearRampToValueAtTime(
      20000,
      audioCtx.current.currentTime + 0.4
    );
  };

  const onEnterButton = (type: "player" | "cv") => {
    setHovered(type);
    playHoverSound();
    applyLowpass();
  };

  const onLeaveButton = () => {
    setHovered(null);
    removeLowpass();
  };

  return (
    <>
      {/* ⭐ ENTER OVERLAY */}
      {!hasEntered && (
        <div
          onClick={audioReady ? handleEnter : undefined}
          style={{
            position: "fixed",
            inset: 0,
            background: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "3rem",
            cursor: audioReady ? "pointer" : "default",
            opacity: audioReady ? 1 : 0.3,
            transition: "opacity 0.4s ease",
            zIndex: 9999,
          }}
        >
          {audioReady ? "ENTER" : "LOADING..."}
        </div>
      )}

      {/* MAIN PAGE */}
      <main
        style={{
          width: "100vw",
          height: "100vh",
          background: "#19191b",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100vw, 900px)",
            height: "min(calc(100vw * 1.4), 1260px)",
            maxWidth: "900px",
            maxHeight: "1260px",
          }}
        >
          {/* BACKGROUND */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              filter: hovered ? "blur(6px)" : "none",
              transition: "filter 0.7s ease",
            }}
          >
            <Image
              src="/next/image/cars2.png"
              alt=""
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "contain", pointerEvents: "none" }}
            />
          </div>

          {/* HOVER IMAGES */}
          {hovered === "player" && (
            <Image
              src="/next/image/player_selected.png"
              alt=""
              fill
              style={{
                objectFit: "contain",
                position: "absolute",
                inset: 0,
                zIndex: 10,
              }}
            />
          )}

          {hovered === "cv" && (
            <Image
              src="/next/image/cv_selected.png"
              alt=""
              fill
              style={{
                objectFit: "contain",
                position: "absolute",
                inset: 0,
                zIndex: 10,
              }}
            />
          )}

          {/* BUTTONS */}
          <button
            onMouseEnter={() => onEnterButton("player")}
            onMouseLeave={onLeaveButton}
            onClick={() => fadeOut("/player")}
            style={{
              position: "absolute",
              left: "19%",
              top: "40%",
              width: "15%",
              height: "12%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 20,
            }}
          />

          <button
            onMouseEnter={() => onEnterButton("cv")}
            onMouseLeave={onLeaveButton}
            onClick={() => fadeOut("/cv")}
            style={{
              position: "absolute",
              left: "65%",
              top: "40%",
              width: "20%",
              height: "20%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 20,
            }}
          />
        </div>
      </main>
    </>
  );
}
