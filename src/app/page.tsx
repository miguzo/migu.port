"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function HomeMenu() {
  const router = useRouter();
  const [hovered, setHovered] = useState<null | "player" | "cv">(null);

  // ENTER overlay states
  const [hasEntered, setHasEntered] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // AUDIO CONTEXT + NODES
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientBuffer = useRef<AudioBuffer | null>(null);
  const ambientSource = useRef<AudioBufferSourceNode | null>(null);
  const lowpassFilter = useRef<BiquadFilterNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);

  // ⭐ Restore ENTER state from previous visit
  useEffect(() => {
    const enteredBefore = localStorage.getItem("hasEntered");
    if (enteredBefore === "true") {
      setHasEntered(true); // Skip ENTER screen
    }
  }, []);

  // ---------- LOAD HOVER SOUND ----------
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
    hoverSound.current.volume = 1.0;
  }, []);

  // ---------- INIT AUDIO + PRELOAD AMBIENT ----------
  useEffect(() => {
    audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;

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

  // ---------- START AMBIENT ----------
  const startAmbientSound = () => {
    if (
      !audioCtx.current ||
      !ambientBuffer.current ||
      ambientStarted.current ||
      !lowpassFilter.current ||
      !volumeGain.current
    ) return;

    const ctx = audioCtx.current;

    const source = ctx.createBufferSource();
    source.buffer = ambientBuffer.current;
    source.loop = true;

    source.connect(lowpassFilter.current);
    lowpassFilter.current.connect(volumeGain.current);
    volumeGain.current.connect(ctx.destination);

    volumeGain.current.gain.setValueAtTime(0, ctx.currentTime);
    volumeGain.current.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1);

    source.start();
    ambientSource.current = source;
    ambientStarted.current = true;
  };

  // ---------- ENTER BUTTON ----------
  const handleEnter = async () => {
    if (!audioReady) return;

    if (audioCtx.current?.state === "suspended") {
      await audioCtx.current.resume();
    }

    startAmbientSound();
    setHasEntered(true);

    // ⭐ Save so it doesn't show again
    localStorage.setItem("hasEntered", "true");
  };

  // ---------- HOVER SOUND ----------
  const playHoverSound = () => {
    if (!hoverSound.current) return;
    hoverSound.current.currentTime = 0;
    hoverSound.current.play();
  };

  // ---------- LOWPASS ----------
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

  // ---------- FADE OUT ----------
  const fadeOutAndNavigate = (path: string) => {
    if (!audioCtx.current) {
      router.push(path);
      return;
    }

    const ctx = audioCtx.current;

    if (volumeGain.current) {
      const v = volumeGain.current.gain;
      v.cancelScheduledValues(ctx.currentTime);
      v.setValueAtTime(v.value, ctx.currentTime);
      v.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }

    setTimeout(() => {
      router.push(path);
    }, 600);
  };

  const onEnter = (type: "player" | "cv") => {
    setHovered(type);
    playHoverSound();
    applyLowpass();
  };

  const onLeave = () => {
    setHovered(null);
    removeLowpass();
  };

  return (
    <>
      {/* ========= ENTER SCREEN ONLY FIRST TIME ========= */}
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
            zIndex: 9999,
            transition: "opacity 0.4s ease",
          }}
        >
          {audioReady ? "ENTER" : "LOADING..."}
        </div>
      )}

      {/* ===================== MAIN PAGE ===================== */}
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
        {/* ...rest identical */}
      </main>
    </>
  );
}
