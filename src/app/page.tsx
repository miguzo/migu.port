"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

// --- Types ---
type ButtonImage = { on: string; off: string };
type ButtonPos = { left: string; top: string; width: string; height: string };
type Track = { src: string; titleImg: string };
type Project = { bg: string; playlist: Track[] };

// --- Constants with Types ---
const BUTTON_IMAGES: ButtonImage[] = [
  { on: "/next/image/Button 1 ON.png", off: "/next/image/Button 1 Off.png" },
  { on: "/next/image/Button 2 ON.png", off: "/next/image/Button 2 Off.png" },
  { on: "/next/image/Button 3 ON.png", off: "/next/image/Button 3 Off.png" },
  { on: "/next/image/Button 4 On.png",  off: "/next/image/Button 4 Off.png" },
];

const topButtonPositions: ButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Play
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Pause
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Track
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Project
];

const bottomButton: ButtonPos = {
  left: "24%",
  top: "76%",
  width: "52%",
  height: "8.7%",
};

const projects: Project[] = [
  {
    bg: "/next/image/Fragments.png",
    playlist: [
      { src: "/music/1.Hunters.mp3", titleImg: "/next/image/1Hunters.png" },
      { src: "/music/2.Double Crossed.mp3", titleImg: "/next/image/2Doublecross.png" },
      { src: "/music/3.The Rabbit.mp3", titleImg: "/next/image/3Rabbit.png" },
    ],
  },
  // You can add more projects later!
];

// --- Preload images utility (typed) ---
function getPreloadImages(): string[] {
  // All button images, frame, background, title images, splash image
  const images = [
    ...BUTTON_IMAGES.flatMap(img => [img.on, img.off]),
    "/next/image/NewCardFrameEmpty.png",
    "/next/image/Loading.png",
    ...projects.map(p => p.bg),
    ...projects.flatMap(p => p.playlist.map(t => t.titleImg)),
  ];
  return Array.from(new Set(images));
}
function preloadImages(imgs: string[]): Promise<void> {
  return Promise.all(
    imgs.map(
      src =>
        new Promise<void>(resolve => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        })
    )
  ).then(() => {});
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Splash states
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  // Player states
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3>(null);

  // Title image logic
  const [titleImgSrc, setTitleImgSrc] = useState(projects[0].playlist[0].titleImg);
  const lastTrack = useRef<{projectIdx: number, trackIdx: number}>({ projectIdx: 0, trackIdx: 0 });

  useEffect(() => {
    if (
      projectIdx !== lastTrack.current.projectIdx ||
      trackIdx !== lastTrack.current.trackIdx
    ) {
      const nextImg = projects[projectIdx].playlist[trackIdx].titleImg;
      const img = new window.Image();
      img.onload = () => setTitleImgSrc(nextImg);
      img.onerror = () => setTitleImgSrc(nextImg);
      img.src = nextImg;
      lastTrack.current = { projectIdx, trackIdx };
    }
  }, [projectIdx, trackIdx]);

  // Button Sound: create new audio object every press (fixes iOS bug)
  function playButtonSound() {
    const sfx = new window.Audio("/sounds/Button.mp3");
    sfx.play().catch(() => {});
    sfx.onended = () => { sfx.remove?.(); };
  }

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
  function handleNextTrack() {
    playButtonSound();
    setPressedIdx(2);
    setTimeout(() => {
      goToNextTrack();
      setPressedIdx(null);
    }, 1000);
  }
  function handleNextProject() {
    playButtonSound();
    setPressedIdx(3);
    setTimeout(() => {
      setProjectIdx((p) => (p + 1) % projects.length);
      setTrackIdx(0);
      setPressedIdx(null);
    }, 1000);
  }
  function goToNextTrack() {
    const playlist = projects[projectIdx].playlist;
    const nextIdx = (trackIdx + 1) % playlist.length;
    setTrackIdx(nextIdx);
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  // Update audio src on track/project change (no autoplay)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = projects[projectIdx].playlist[trackIdx].src;
    audio.load();
  }, [projectIdx, trackIdx]);

  // Auto-next when song ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPressedIdx(2);
      setTimeout(() => {
        goToNextTrack();
        setPressedIdx(null);
      }, 1000);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [projectIdx, trackIdx]);

  // Body overflow
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // PRELOAD (images only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    preloadImages(getPreloadImages()).then(() => setReady(true));
  }, []);

  // Fade out splash
  function dismissSplash() {
    if (ready) {
      setFadeSplash(true);
      setTimeout(() => setShowSplash(false), 600);
    }
  }

  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
      </Head>
      {/* --- Splash overlay always renders, app is mounted behind --- */}
      <div
        onClick={dismissSplash}
        onTouchEnd={dismissSplash}
        style={{
          position: "fixed",
          inset: 0,
          background: "#19191b",
          zIndex: 10000,
          display: showSplash ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          cursor: ready ? "pointer" : "default",
          opacity: fadeSplash ? 0 : 1,
          transition: "opacity 0.55s cubic-bezier(.4,.13,.35,1)",
        }}
      >
        <Image
          src="/next/image/Loading.png"
          alt="Splash"
          fill
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 10001,
            transition: "opacity 0.5s",
          }}
          priority
        />
      </div>

      {/* --- Main App UI always mounted, only covered by splash --- */}
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
          {/* --- BG --- */}
          <Image
            src={project.bg}
            alt="Project Background"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center 25%",
              transform: "scale(0.5)",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
            priority
          />

          {/* --- Frame --- */}
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

          {/* --- TITLE IMAGE --- */}
          <Image
            src={titleImgSrc}
            alt="Song Title"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center",
              zIndex: 15,
              pointerEvents: "none",
              userSelect: "none",
            }}
            priority
          />

          {/* --- Buttons PNGs --- */}
          {BUTTON_IMAGES.map((img, idx) => (
            <Image
              key={idx}
              src={pressedIdx === idx ? img.on : img.off}
              alt={`Button ${idx + 1}`}
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 11,
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority={idx === 0}
            />
          ))}

          {/* --- HOTZONE BUTTONS --- */}
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
          <button
            aria-label="Next Track"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 2 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleNextTrack}
            tabIndex={0}
          />
          <button
            aria-label="Next Project"
            style={{
              ...topButtonPositions[3],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pressedIdx === 3 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleNextProject}
            tabIndex={0}
          />

          {/* Bottom Button (optional) */}
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
            onClick={() => alert("Bottom Button clicked!")}
            tabIndex={0}
          />

          {/* Hidden audio for music */}
          <audio ref={audioRef} hidden src={currentTrack.src} />
        </div>
      </main>
    </>
  );
}
