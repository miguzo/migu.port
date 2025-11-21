"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function HomeMenu() {
  const router = useRouter();

  // Hover highlight
  const [hovered, setHovered] = useState<null | "player" | "cv">(null);

  // ENTER screen states
  const [hasEntered, setHasEntered] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // Audio refs
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientBuffer = useRef<AudioBuffer | null>(null);
  const ambientSource = useRef<AudioBufferSourceNode | null>(null);
  const lowpassFilter = useRef<BiquadFilterNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);

  // -------------------------------------------------------------
  // LOAD HOVER SOUND
  // -------------------------------------------------------------
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
    hoverSound.current.volume = 1;
  }, []);

  // -------------------------------------------------------------
  // CHECK IF USER ALREADY ENTERED BEFORE
  // -------------------------------------------------------------
  useEffect(() => {
    const already = localStorage.getItem("entered");
    if (already === "true") {
      setHasEntered(true);
    }
  }, []);

  // -------------------------------------------------------------
  // INIT AUDIO + PRELOAD AMBIENT
  // -------------------------------------------------------------
  useEffect(() => {
    const ctx = new AudioContext();
    audioCtx.current = ctx;

    lowpassFilter.current = ctx.createBiquadFilter();
    lowpassFilter.current.type = "lowpass";
    lowpassFilter.current.frequency.setValueAtTime(20000, ctx.currentTime);

    volumeGain.current = ctx.createGain();
    volumeGain.current.gain.value = 0;

    fetch("/sounds/Ambient.mp3")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        ambientBuffer.current = decoded;
        setAudioReady(true);
      });
  }, []);

  // -------------------------------------------------------------
  // START AMBIENT LOOP
  // -------------------------------------------------------------
  const startAmbientSound = () => {
    if (
      !audioCtx.current ||
      !ambientBuffer.current ||
      !lowpassFilter.current ||
      !volumeGain.current ||
      ambientStarted.current
    ) {
      return;
    }

    const ctx = audioCtx.current;
    const src = ctx.createBufferSource();

    src.buffer = ambientBuffer.current;
    src.loop = true;

    src.connect(lowpassFilter.current);
    lowpassFilter.current.connect(volumeGain.current);
    volumeGain.current.connect(ctx.destination);

    volumeGain.current.gain.setValueAtTime(0, ctx.currentTime);
    volumeGain.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);

    src.start();
    ambientSource.current = src;
    ambientStarted.current = true;
  };

  // -------------------------------------------------------------
  // ENTER BUTTON
  // -------------------------------------------------------------
  const handleEnter = async () => {
    if (!audioReady) return;

    if (audioCtx.current?.state === "suspended") {
      await audioCtx.current.resume();
    }

    startAmbientSound();
    setHasEntered(true);

    localStorage.setItem("entered", "true");
  };

  // -------------------------------------------------------------
  // HOVER SOUND + LOWPASS
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // PAGE FADE OUT + NAVIGATION
  // -------------------------------------------------------------
  const fadeOutAndNavigate = (path: string) => {
    if (!audioCtx.current || !volumeGain.current) {
      router.push(path);
      return;
    }

    const ctx = audioCtx.current;
    const gain = volumeGain.current.gain;

    gain.cancelScheduledValues(ctx.currentTime);
    gain.setValueAtTime(gain.value, ctx.currentTime);
    gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);

    setTimeout(() => router.push(path), 600);
  };

  // -------------------------------------------------------------
  // HOVER HANDLERS
  // -------------------------------------------------------------
  const onEnter = (type: "player" | "cv") => {
    setHovered(type);
    playHoverSound();
    applyLowpass();
  };

  const onLeave = () => {
    setHovered(null);
    removeLowpass();
  };

  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <>
      {/* ENTER SCREEN — only first time */}
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
            opacity: audioReady ? 1 : 0.4,
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
              width: "100%",
              height: "100%",
              filter: hovered ? "blur(6px)" : "none",
              transition: "filter 0.3s ease",
            }}
          >
            <Image
              src="/next/image/cars2.png"
              alt="Menu"
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
              style={{ objectFit: "contain", position: "absolute", inset: 0, zIndex: 10 }}
            />
          )}

          {hovered === "cv" && (
            <Image
              src="/next/image/cv_selected.png"
              alt=""
              fill
              style={{ objectFit: "contain", position: "absolute", inset: 0, zIndex: 10 }}
            />
          )}

          {/* BUTTONS */}
          <button
            onMouseEnter={() => onEnter("player")}
            onMouseLeave={onLeave}
            onClick={() => fadeOutAndNavigate("/player")}
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
            onMouseEnter={() => onEnter("cv")}
            onMouseLeave={onLeave}
            onClick={() => fadeOutAndNavigate("/cv")}
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
