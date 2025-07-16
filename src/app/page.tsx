"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { Howl } from "howler";

// --- TYPES ---
type ButtonImage = { on: string; off: string };
type TopButtonPos = { left: string; top: string; width: string; height: string };
type Project = {
  bg: string;
  pageImg: string;
  playlist: { src: string; titleImg: string }[];
};

// --- DATA ---
const BUTTON_IMAGES: ButtonImage[] = [
  { on: "/next/image/Button 1 ON.png", off: "/next/image/Button 1 Off.png" },
  { on: "/next/image/Button 2 ON.png", off: "/next/image/Button 2 Off.png" },
  { on: "/next/image/Button 3 ON.png", off: "/next/image/Button 3 Off.png" },
  { on: "/next/image/Button 4 On.png", off: "/next/image/Button 4 Off.png" },
  { on: "/next/image/Button5On.png", off: "/next/image/Button5Off.png" },
];

const topButtonPositions: TopButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Play
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Pause
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Track
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" }, // Next Project
  { left: "24%", top: "76%", width: "52%", height: "8.7%" },     // 5th Button
];

const projects: Project[] = [
  {
    bg: "/next/image/Fragments.png",
    pageImg: "/next/image/FragmentsPAGE.png",
    playlist: [
      { src: "/music/1Lidge.mp3", titleImg: "/next/image/1Lidge.png" },
      { src: "/music/2DoubleCrossed.mp3", titleImg: "/next/image/2Doublecross.png" },
      { src: "/music/3Walz.mp3", titleImg: "/next/image/3Walz.png" },
      { src: "/music/4TheRabbit.mp3", titleImg: "/next/image/4Rabbit.png" },
      { src: "/music/5Orphan.mp3", titleImg: "/next/image/5Orphan.png" },
    
    ],
  },
  // Add more projects if needed
];

// --- PRELOAD HELPERS ---
function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
}
function preloadHowl(src: string) {
  return new Promise<void>((resolve, reject) => {
    new Howl({
      src: [src],
      preload: true,
      html5: true,
      onload: () => resolve(),
      onloaderror: () => reject(),
    });
  });
}

export default function Home() {
  // --- State ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [projectIdx, setProjectIdx] = useState<number>(0);
  const [trackIdx, setTrackIdx] = useState<number>(0);
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3 | 4>(null);
  const [pageOpen, setPageOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  // --- SFX
  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  // --- PRELOAD ---
  useEffect(() => {
    async function doPreload() {
      const imageList: string[] = [
        ...BUTTON_IMAGES.flatMap(btn => [btn.on, btn.off]),
        ...projects.flatMap(proj => [
          proj.bg,
          proj.pageImg,
          ...proj.playlist.map(track => track.titleImg),
        ]),
        "/next/image/Loading.png",
        "/next/image/NewCardFrameEmpty.png",
      ];
      const audioList: string[] = [
        "/sounds/Button.mp3",
        "/sounds/PageON.mp3",
        "/sounds/PageOFF.mp3",
        ...projects.flatMap(proj => proj.playlist.map(track => track.src)),
      ];

      await Promise.all([
        ...imageList.map(src => preloadImage(src).catch(() => {})),
        ...audioList.map(src => preloadHowl(src).catch(() => {})),
      ]);

      buttonSound.current = new Howl({ src: ["/sounds/Button.mp3"], html5: true });
      pageOnSound.current = new Howl({ src: ["/sounds/PageON.mp3"], html5: true });
      pageOffSound.current = new Howl({ src: ["/sounds/PageOFF.mp3"], html5: true });

      setLoading(false);
    }
    doPreload();
  }, []);

  // --- BODY LOCK
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- AUDIO logic ---
  function playButtonFx() {
    buttonSound.current?.stop();
    buttonSound.current?.play();
  }
  function playPageOnFx() {
    pageOnSound.current?.stop();
    pageOnSound.current?.play();
  }
  function playPageOffFx() {
    pageOffSound.current?.stop();
    pageOffSound.current?.play();
  }

  function handlePlay() {
    if (pressedIdx === 0 || pageOpen) return;
    playButtonFx();
    audioRef.current?.play();
    setPressedIdx(0);
  }
  function handlePause() {
    if (pressedIdx === 1 || pageOpen) return;
    playButtonFx();
    audioRef.current?.pause();
    setPressedIdx(1);
  }
  function handleNextTrack() {
    if (pageOpen) return;
    playButtonFx();
    setPressedIdx(2);
    setTimeout(() => {
      const nextIdx = (trackIdx + 1) % projects[projectIdx].playlist.length;
      setTrackIdx(nextIdx);
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPressedIdx(null);
    }, 600);
  }
  function handleNextProject() {
    if (pageOpen) return;
    playButtonFx();
    setPressedIdx(3);
    setTimeout(() => {
      const nextProject = (projectIdx + 1) % projects.length;
      setProjectIdx(nextProject);
      setTrackIdx(0);
      setPressedIdx(null);
    }, 600);
  }
  function handlePageBtn() {
    if (pageOpen) return;
    playPageOnFx();
    setPageOpen(true);
  }
  function handlePageClose() {
    playPageOffFx();
    setPageOpen(false);
  }

  // --- MUSIC src update when track/project changes ---
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = projects[projectIdx].playlist[trackIdx].src;
    audioRef.current.load();
  }, [projectIdx, trackIdx]);

  // --- Auto next when song ends ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPressedIdx(2);
      setTimeout(() => {
        const nextIdx = (trackIdx + 1) % projects[projectIdx].playlist.length;
        setTrackIdx(nextIdx);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setPressedIdx(null);
      }, 600);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [projectIdx, trackIdx]);

  // --- TITLE: only hide previous when new is loaded (no fade) ---
  const [titleLoaded, setTitleLoaded] = useState(true);
  const [prevTitleImg, setPrevTitleImg] = useState(projects[0].playlist[0].titleImg);
  useEffect(() => {
    setTitleLoaded(false);
  }, [projectIdx, trackIdx]);
  function handleTitleLoad() {
    setTitleLoaded(true);
    setPrevTitleImg(projects[projectIdx].playlist[trackIdx].titleImg);
  }

  // --- RENDER ---
  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, orientation=portrait" />
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
          {/* --- Loading Splash: overlays everything until user clicks/taps --- */}
          {(loading || !splashDone) && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "#111",
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: loading ? "default" : "pointer",
                transition: "opacity 0.6s",
              }}
              onClick={() => {
                if (!loading) setSplashDone(true);
              }}
            >
              <Image
                src="/next/image/Loading.png"
                alt="splash"
                width={430}
                height={620}
                priority
                style={{
                  width: "min(98vw, 430px)",
                  height: "auto",
                  objectFit: "contain",
                  maxHeight: "620px",
                  maxWidth: "430px",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* --- Project BG --- */}
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

          {/* --- Frame (empty) --- */}
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
          />

          {/* --- Title image --- */}
          {(!titleLoaded && (
            <Image
              src={prevTitleImg}
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
          ))}
          <Image
            src={currentTrack.titleImg}
            alt="Song Title"
            fill
            onLoad={handleTitleLoad}
            style={{
              objectFit: "contain",
              objectPosition: "center",
              zIndex: 16,
              pointerEvents: "none",
              userSelect: "none",
              visibility: titleLoaded ? "visible" : "hidden",
            }}
            priority
          />

          {/* --- PAGE OVERLAY: always same size as frame --- */}
          {pageOpen && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 30,
                cursor: "pointer",
              }}
              onClick={handlePageClose}
            >
              <Image
                src={project.pageImg}
                alt="Project Page"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  zIndex: 31,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                priority
              />
            </div>
          )}

          {/* --- Render Button PNGs --- */}
          {BUTTON_IMAGES.map((img, idx) => (
            <Image
              key={idx}
              src={pressedIdx === idx ? img.on : img.off}
              alt=""
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

          {/* --- Button Hotzones (top + 5th) --- */}
          {/* 1 - Play */}
          <button
            aria-label="Play"
            style={{
              ...topButtonPositions[0],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pageOpen || pressedIdx === 0 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handlePlay}
            tabIndex={0}
          />
          {/* 2 - Pause */}
          <button
            aria-label="Pause"
            style={{
              ...topButtonPositions[1],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pageOpen || pressedIdx === 1 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handlePause}
            tabIndex={0}
          />
          {/* 3 - Next Track */}
          <button
            aria-label="Next Track"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pageOpen || pressedIdx === 2 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleNextTrack}
            tabIndex={0}
          />
          {/* 4 - Next Project */}
          <button
            aria-label="Next Project"
            style={{
              ...topButtonPositions[3],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pageOpen || pressedIdx === 3 ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handleNextProject}
            tabIndex={0}
          />
          {/* 5 - Page Button */}
          <button
            aria-label="Show Project Page"
            style={{
              ...topButtonPositions[4],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: pageOpen ? "default" : "pointer",
              zIndex: 20,
            }}
            onClick={handlePageBtn}
            tabIndex={0}
          />

          {/* --- Hidden audio player for actual music --- */}
          <audio ref={audioRef} hidden src={currentTrack.src} />
        </div>
      </main>
    </>
  );
}
