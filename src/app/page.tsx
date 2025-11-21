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

  // ---------- LOAD HOVER SOUND ----------
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
    hoverSound.current.volume = 1.0;
  }, []);

  // ---------- INIT AUDIO + PRELOAD AMBIENT ----------
  useEffect(() => {
    audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;

    // Create nodes
    lowpassFilter.current = ctx.createBiquadFilter();
    lowpassFilter.current.type = "lowpass";
    lowpassFilter.current.frequency.setValueAtTime(20000, ctx.currentTime);

    volumeGain.current = ctx.createGain();
    volumeGain.current.gain.value = 0;

    // Preload and decode ambient
    fetch("/sounds/Ambient.mp3")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        ambientBuffer.current = decoded;
        setAudioReady(true); // 🔥 AMBIENT IS READY
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
    ) {
      return;
    }

    const ctx = audioCtx.current;

    const source = ctx.createBufferSource();
    source.buffer = ambientBuffer.current;
    source.loop = true;

    source.connect(lowpassFilter.current);
    lowpassFilter.current.connect(volumeGain.current);
    volumeGain.current.connect(ctx.destination);

    // Fade in
    volumeGain.current.gain.setValueAtTime(0, ctx.currentTime);
    volumeGain.current.gain.linearRampToValueAtTime(
      0.3,
      ctx.currentTime + 1
    );

    source.start();
    ambientSource.current = source;
    ambientStarted.current = true;
  };

  // ---------- ENTER BUTTON ----------
  const handleEnter = async () => {
    if (!audioReady) return; // can't enter yet

    if (audioCtx.current?.state === "suspended") {
      await audioCtx.current.resume();
    }

    startAmbientSound();
    setHasEntered(true); // hide overlay
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

  // ---------- BUTTON HOVER ----------
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
      {/* ===================== ENTER OVERLAY ===================== */}
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
        <div
          style={{
            position: "relative",
            width: "min(100vw, 900px)",
            height: "min(calc(100vw * 1.4), 1260px)",
            maxWidth: "900px",
            maxHeight: "1260px",
          }}
        >
          {/* === BACKGROUND === */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              filter: hovered ? "blur(6px)" : "none",
              transition: "filter 0.3s ease",
            }}
          >
            <Image
              src="/next/image/cars2.png"
              alt="Menu principal"
              fill
              priority
              sizes="100vw"
              style={{
                objectFit: "contain",
                objectPosition: "center",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* === OVERLAYS === */}
          {hovered === "player" && (
            <Image
              src="/next/image/player_selected.png"
              alt=""
              fill
              style={{
                objectFit: "contain",
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
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
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          {/* === BUTTONS === */}
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
