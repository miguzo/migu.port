"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function HomeMenu() {
  const router = useRouter();

  // null = haven't checked localStorage yet
  // true/false = overlay state
  const [hasEntered, setHasEntered] = useState<boolean | null>(null);

  const [audioReady, setAudioReady] = useState(false);
  const [hovered, setHovered] = useState<null | "player" | "cv">(null);

  // AUDIO
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientBuffer = useRef<AudioBuffer | null>(null);
  const ambientSource = useRef<AudioBufferSourceNode | null>(null);
  const lowpassFilter = useRef<BiquadFilterNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);

  // -------------------------------------------
  // LOAD HOVER SOUND
  // -------------------------------------------
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
  }, []);

  // -------------------------------------------
  // SAFELY READ localStorage AFTER hydration
  // -------------------------------------------
  useEffect(() => {
    // Prevent hydration glitch:
    // Wait 1 tick so React DOM exists
    setTimeout(() => {
      const flag = localStorage.getItem("entered");
      setHasEntered(flag === "true"); // first visit => false
    }, 50);
  }, []);

  // -------------------------------------------
  // INIT AUDIO + PRELOAD AMBIENT
  // -------------------------------------------
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

  // -------------------------------------------
  // START AMBIENT AUDIO
  // -------------------------------------------
  const startAmbient = () => {
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

  // -------------------------------------------
  // ENTER BUTTON
  // -------------------------------------------
  const handleEnter = async () => {
    if (!audioReady) return;

    if (audioCtx.current?.state === "suspended") {
      await audioCtx.current.resume();
    }

    startAmbient();

    setHasEntered(true);
    localStorage.setItem("entered", "true");
  };

  // -------------------------------------------
  // NAVIGATION FADE
  // -------------------------------------------
  const fadeOutAndNavigate = (path: string) => {
    if (!audioCtx.current || !volumeGain.current) {
      router.push(path);
      return;
    }

    const ctx = audioCtx.current;
    const gain = volumeGain.current.gain;

    gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    setTimeout(() => router.push(path), 500);
  };

  // -------------------------------------------
  // HOVER LOGIC
  // -------------------------------------------
  const onEnter = (type: "player" | "cv") => {
    setHovered(type);
    if (hoverSound.current) {
      hoverSound.current.currentTime = 0;
      hoverSound.current.play();
    }
  };

  const onLeave = () => setHovered(null);

  // -------------------------------------------
  // BEFORE WE KNOW localStorage → render nothing
  // -------------------------------------------
  if (hasEntered === null) return null;

  return (
    <>
      {/* FIRST-TIME ENTER SCREEN */}
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

      {/* MAIN PAGE */}
      <main
        style={{
          width: "100vw",
          height: "100vh",
          background: "#19191b",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(100vw, 900px)",
            height: "min(calc(100vw * 1.4), 1260px)",
          }}
        >
          <Image
            src="/next/image/cars2.png"
            alt=""
            fill
            priority
            style={{ objectFit: "contain", filter: hovered ? "blur(6px)" : "none" }}
          />

          {hovered === "player" && (
            <Image
              src="/next/image/player_selected.png"
              alt=""
              fill
              style={{ objectFit: "contain", position: "absolute", zIndex: 10 }}
            />
          )}

          {hovered === "cv" && (
            <Image
              src="/next/image/cv_selected.png"
              alt=""
              fill
              style={{ objectFit: "contain", position: "absolute", zIndex: 10 }}
            />
          )}

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
            }}
          />
        </div>
      </main>
    </>
  );
}
