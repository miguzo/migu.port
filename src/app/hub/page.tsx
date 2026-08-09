"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { HUB_SIZES } from "@/lib/player-config";
import { DustOverlay } from "@/components/DustOverlay";

/** Remembers that the ambient bed has already been unlocked this session. */
const ENTERED_KEY = "hub:entered";

/** The CV zone leaves the site rather than opening the local /cv page. */
const CV_URL = "https://igordubreucq.com";

/**
 * Visual fade to black on exit. Deliberately shorter than NAVIGATE_DELAY_MS:
 * when both were 600ms the next page could mount while the screen was still
 * translucent, so you saw it loading through the fade. Now the screen is
 * solid black for ~300ms before anything changes.
 */
const EXIT_FADE_MS = 300;

/** Matches the 0.6s audio gain ramp, so the sound finishes fading too. */
const NAVIGATE_DELAY_MS = 600;

type ZoneId = "player" | "recorder" | "cv" | "tv";

/** The lit-up artwork shown while a zone is hovered. */
const HOVER_ART: Record<ZoneId, string> = {
  player: "/next/image/player_selected.png",
  cv: "/next/image/cv_selected.png",
  recorder: "/next/image/recorder.png",
  tv: "/next/image/tv.png",
};

type Zone = {
  id: ZoneId;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  /** An app route, a full URL, or "recorder" to play a sound instead. */
  target: string;
};

/**
 * Hotzones over the artwork. Several zones may share an id: they then light
 * the same overlay and do the same thing, which is how the note, and the other
 * player objects in the scene, all lead to the music player.
 *
 * Percentages are of the container box, not of the image. The container is
 * portrait (900x1260) while carsnew.png is landscape, so `contain` letterboxes
 * it: the picture occupies the full width but only the middle ~54% of the
 * height. That is why the vertical numbers look compressed.
 */
const ZONES: Zone[] = [
  // The handwritten note on the plinth.
  { id: "player",   label: "Music player",           left: "18%",   top: "36%",   width: "15%", height: "10%",  target: "/" },
  // The keypad unit standing on top of the plinth.
  { id: "player",   label: "Music player",           left: "23%",   top: "29.8%", width: "11%", height: "5.2%", target: "/" },
  // The keypad unit on the floor, against the base of the plinth.
  { id: "player",   label: "Music player",           left: "16.5%", top: "61%",   width: "9%",  height: "8%",   target: "/" },

  { id: "cv",       label: "CV (igordubreucq.com)",  left: "73%",   top: "43%",   width: "15%", height: "10%",  target: CV_URL },
  { id: "recorder", label: "Tape recorder",          left: "54%",   top: "26%",   width: "15%", height: "10%",  target: "recorder" },
  { id: "tv",       label: "TV",                     left: "38%",   top: "45%",   width: "15%", height: "10%",  target: "/tv" },
];

const isExternal = (target: string) => /^https?:\/\//i.test(target);

export default function HomeMenu() {
  const router = useRouter();
  const [hovered, setHovered] = useState<null | "player" | "recorder" | "cv" | "tv">(null);

  // ENTER overlay states
  const [hasEntered, setHasEntered] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  /** Fading to black on the way out. */
  const [leaving, setLeaving] = useState(false);

  // AUDIO CONTEXT + NODES
  const audioCtx = useRef<AudioContext | null>(null);
  const ambientBuffer = useRef<AudioBuffer | null>(null);
  const ambientSource = useRef<AudioBufferSourceNode | null>(null);
  const lowpassFilter = useRef<BiquadFilterNode | null>(null);
  const volumeGain = useRef<GainNode | null>(null);

  const hoverSound = useRef<HTMLAudioElement | null>(null);
  const clickSound = useRef<HTMLAudioElement | null>(null);
  const ambientStarted = useRef(false);

  // ⭐ Recorder audio (persistent, no overlapping)
  const recorderAudioRef = useRef<HTMLAudioElement | null>(null);

  const recorderSounds = ["/sounds/Sadness.mp3", "/sounds/Climbing.mp3"];
  const recorderIndex = useRef(0);

  const playNextRecorderSound = () => {
    playClickSound(); // CLICK SOUND FIRST

    // Stop previous playing sound to prevent overlap
    if (recorderAudioRef.current) {
      recorderAudioRef.current.pause();
      recorderAudioRef.current.currentTime = 0;
    }

    const index = recorderIndex.current;
    const audio = new Audio(recorderSounds[index]);
    recorderAudioRef.current = audio;

    audio.volume = 1;
    audio.play();

    recorderIndex.current = (index + 1) % recorderSounds.length;
  };

  // ---------- LOAD HOVER SOUND ----------
  useEffect(() => {
    hoverSound.current = new Audio("/sounds/PageON.mp3");
    hoverSound.current.volume = 1.0;

    clickSound.current = new Audio("/sounds/Button.mp3");
    clickSound.current.volume = 1.0;
  }, []);

  const playClickSound = () => {
    if (!clickSound.current) return;
    clickSound.current.currentTime = 0;
    clickSound.current.play();
  };

  // ---------- INIT AUDIO + PRELOAD AMBIENT ----------
  useEffect(() => {
    audioCtx.current = new AudioContext();
    const ctx = audioCtx.current;

    lowpassFilter.current = ctx.createBiquadFilter();
    lowpassFilter.current.type = "lowpass";
    lowpassFilter.current.frequency.setValueAtTime(20000, ctx.currentTime);

    volumeGain.current = ctx.createGain();
    volumeGain.current.gain.value = 0;

    let cancelled = false;
    fetch("/sounds/Ambient.mp3")
      .then((res) => res.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((decoded) => {
        if (cancelled) return;
        ambientBuffer.current = decoded;
        setAudioReady(true);
      })
      .catch(() => {});

    // Without this the AudioContext outlives the page: navigating away with
    // the browser back button (rather than through fadeOutAndNavigate, which
    // ramps the gain down) left the ambient loop playing over the next page.
    return () => {
      cancelled = true;
      ambientSource.current?.stop();
      ambientSource.current = null;
      ambientStarted.current = false;
      ctx.close().catch(() => {});
    };
  }, []);

  // ---------- SHOULD THE ENTER GATE APPEAR AT ALL? ----------
  // It only exists to obtain the user gesture that lets an AudioContext start.
  // Coming from the player via "i", or back from /tv and /cv, is a client-side
  // navigation: the document already has user activation, so no gesture is
  // needed and the gate is pure friction. Same once this session has entered.
  useEffect(() => {
    const enteredBefore = sessionStorage.getItem(ENTERED_KEY) === "1";
    const alreadyActivated = navigator.userActivation?.hasBeenActive ?? false;
    if (enteredBefore || alreadyActivated) setHasEntered(true);
  }, []);

  useEffect(() => {
    if (hasEntered) sessionStorage.setItem(ENTERED_KEY, "1");
  }, [hasEntered]);

  // ---------- START AMBIENT ----------
  const startAmbientSound = useCallback(() => {
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

    volumeGain.current.gain.setValueAtTime(0, ctx.currentTime);
    volumeGain.current.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 1);

    source.start();
    ambientSource.current = source;
    ambientStarted.current = true;
  }, []);

  // ---------- START THE BED ONCE WE ARE PAST THE GATE ----------
  // If the context cannot resume yet (a cold load straight to /hub, where no
  // gesture has happened), wait silently for the first click or key rather
  // than putting the ENTER screen back up.
  useEffect(() => {
    if (!hasEntered || !audioReady) return;
    let cancelled = false;

    const tryStart = async () => {
      if (cancelled || ambientStarted.current) return;
      try {
        if (audioCtx.current?.state === "suspended") await audioCtx.current.resume();
      } catch { /* needs a gesture; the listeners below will retry */ }
      if (audioCtx.current?.state === "running") {
        startAmbientSound();
        detach();
      }
    };
    const detach = () => {
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
    };

    tryStart();
    window.addEventListener("pointerdown", tryStart);
    window.addEventListener("keydown", tryStart);
    return () => { cancelled = true; detach(); };
  }, [hasEntered, audioReady, startAmbientSound]);

  const handleEnter = () => {
    if (!audioReady) return;
    setHasEntered(true); // the effect above resumes and starts the bed
  };

  // ---------- HOVER ----------
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

  // ⭐ STOP recorder sound on navigate
  const stopRecorderSound = () => {
    if (recorderAudioRef.current) {
      recorderAudioRef.current.pause();
      recorderAudioRef.current.currentTime = 0;
    }
  };

  // ---------- FADE OUT + NAVIGATION ----------
  /** Accepts an app route or a full external URL. */
  const fadeOutAndNavigate = (path: string) => {
    stopRecorderSound(); // <--- IMPORTANT FIX
    // Fade the picture out with the sound. Without it you watched the hub sit
    // there for 600ms and then land on a half-loaded page.
    setLeaving(true);

    const go = () => {
      if (/^https?:\/\//i.test(path)) window.location.href = path;
      else router.push(path);
    };

    if (!audioCtx.current) {
      go();
      return;
    }

    const ctx = audioCtx.current;

    if (volumeGain.current) {
      const v = volumeGain.current.gain;
      v.cancelScheduledValues(ctx.currentTime);
      v.setValueAtTime(v.value, ctx.currentTime);
      v.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }

    setTimeout(go, NAVIGATE_DELAY_MS);
  };

  // ---------- BUTTON HOVER ----------
  const onEnter = (type: "player" | "recorder" | "cv" | "tv") => {
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
      {/* ===================== FADE TO BLACK ON EXIT ===================== */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "black",
          opacity: leaving ? 1 : 0,
          // Swallows further clicks once the exit has started.
          pointerEvents: leaving ? "auto" : "none",
          transition: `opacity ${EXIT_FADE_MS}ms ease`,
          zIndex: 10000,
        }}
      />

      {/* ===================== ENTER OVERLAY ===================== */}
      {!hasEntered && (
        <button
          type="button"
          onClick={handleEnter}
          disabled={!audioReady}
          aria-label={audioReady ? "Enter" : "Loading"}
          style={{
            border: "none",
            font: "inherit",
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
        </button>
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
              src="/next/image/carsnew.png"
              alt="Menu principal"
              fill
              priority
              sizes={HUB_SIZES}
              style={{
                objectFit: "contain",
                objectPosition: "center",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Dust drifts in front of the scene, behind the hotzones. */}
          <DustOverlay />

          {/* === OVERLAYS === */}
          {hovered && (
            <Image
              src={HOVER_ART[hovered]}
              alt=""
              fill
              sizes={HUB_SIZES}
              priority
              style={{
                objectFit: "contain",
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 10,
              }}
            />
          )}

          {/* === HOTZONES === */}
          {ZONES.map((z, i) => {
            const shared = {
              onMouseEnter: () => onEnter(z.id),
              onMouseLeave: onLeave,
              onFocus: () => onEnter(z.id),
              onBlur: onLeave,
              style: {
                position: "absolute" as const,
                left: z.left,
                top: z.top,
                width: z.width,
                height: z.height,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "block",
                zIndex: 20,
              },
            };

            // Leaving the site: a real <a> so ctrl/cmd/middle-click still
            // opens a new tab the normal way.
            if (isExternal(z.target)) {
              return (
                <a
                  key={`${z.id}-${i}`}
                  href={z.target}
                  aria-label={z.label}
                  {...shared}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    fadeOutAndNavigate(z.target);
                  }}
                />
              );
            }

            return (
              <button
                key={`${z.id}-${i}`}
                type="button"
                aria-label={z.label}
                {...shared}
                onClick={
                  z.target === "recorder"
                    ? playNextRecorderSound
                    : () => fadeOutAndNavigate(z.target)
                }
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
