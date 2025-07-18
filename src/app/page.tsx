"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { Howl } from "howler";

// --- TYPES ---
type ButtonImage = { on: string; off: string };
type TopButtonPos = { left: string; top: string; width: string; height: string };
type Project = {
  pageImg: string;
  mainImg: string;
  buttons: ButtonImage[];
  playlist: { src: string; titleImg: string }[];
};

const topButtonPositions: TopButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "24%", top: "76%", width: "52%", height: "8.7%" },
];

const projects: Project[] = [
  {
    mainImg: "/next/image/Fragments/Components/FragmentsCF.png",
    pageImg: "/next/image/Fragments/Components/FragmentsPAGE.png",
    buttons: [
      { on: "/next/image/Fragments/Buttons/Button 1 ON.png", off: "/next/image/Fragments/Buttons/Button 1 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 2 ON.png", off: "/next/image/Fragments/Buttons/Button 2 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 3 ON.png", off: "/next/image/Fragments/Buttons/Button 3 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 4 On.png", off: "/next/image/Fragments/Buttons/Button 4 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button5On.png", off: "/next/image/Fragments/Buttons/Button5Off.png" },
    ],
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/Titles/1Lidge.png" },
      { src: "/music/Fragments/2DoubleCrossed.mp3", titleImg: "/next/image/Fragments/Titles/2Doublecross.png" },
      { src: "/music/Fragments/3Walz.mp3", titleImg: "/next/image/Fragments/Titles/3Walz.png" },
      { src: "/music/Fragments/4TheRabbit.mp3", titleImg: "/next/image/Fragments/Titles/4Rabbit.png" },
      { src: "/music/Fragments/5Orphan.mp3", titleImg: "/next/image/Fragments/Titles/5Orphan.png" },
    ],
  },
  {
    mainImg: "/next/image/Aggragate/Components/AggragateCF.png",
    pageImg: "/next/image/Aggragate/Components/AggragatePAGE.png",
    buttons: [
      { on: "/next/image/Aggragate/Buttons/Button 1 ON.png", off: "/next/image/Aggragate/Buttons/Button 1 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 2 ON.png", off: "/next/image/Aggragate/Buttons/Button 2 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 3 ON.png", off: "/next/image/Aggragate/Buttons/Button 3 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 4 On.png", off: "/next/image/Aggragate/Buttons/Button 4 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button5On.png", off: "/next/image/Aggragate/Buttons/Button5Off.png" },
    ],
    playlist: [
      { src: "/music/Aggragate/1HighRiver.mp3", titleImg: "/next/image/Aggragate/Titles/1HighRiver.png" },
      { src: "/music/Aggragate/2AmongTheStorm.mp3", titleImg: "/next/image/Aggragate/Titles/2AmongTheStorm.png" },
      { src: "/music/Aggragate/3Spectacle.mp3", titleImg: "/next/image/Aggragate/Titles/3Spectacle.png" },
      { src: "/music/Aggragate/4Arrest.mp3", titleImg: "/next/image/Aggragate/Titles/4Arrest.png" },
      { src: "/music/Aggragate/5NoOnesEnnemy.mp3", titleImg: "/next/image/Aggragate/Titles/5NoOnesEnnemy.png" },
      { src: "/music/Aggragate/6PromessField.mp3", titleImg: "/next/image/Aggragate/Titles/6PromessField.png" },
      { src: "/music/Aggragate/7TheArena.mp3", titleImg: "/next/image/Aggragate/Titles/7TheArena.png" },
      { src: "/music/Aggragate/8ADisaster.mp3", titleImg: "/next/image/Aggragate/Titles/8ADisaster.png" },
      { src: "/music/Aggragate/9OfRustAndMirror.mp3", titleImg: "/next/image/Aggragate/Titles/9OfRustAndMirror.png" },
    ],
  },
  {
    mainImg: "/next/image/Fallcore/Components/FallcoreCF.png",
    pageImg: "/next/image/Fallcore/Components/FallcorePAGE.png",
    buttons: [
      { on: "/next/image/Fallcore/Buttons/Button 1 ON.png", off: "/next/image/Fallcore/Buttons/Button 1 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 2 ON.png", off: "/next/image/Fallcore/Buttons/Button 2 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 3 ON.png", off: "/next/image/Fallcore/Buttons/Button 3 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 4 ON.png", off: "/next/image/Fallcore/Buttons/Button 4 Off.png" },  
      { on: "/next/image/Fallcore/Buttons/Button5On.png", off: "/next/image/Fallcore/Buttons/Button5Off.png" },
    ],
    playlist: [
      { src: "/music/Fallcore/1Shutter.mp3", titleImg: "/next/image/Fallcore/Titles/1shutter.png" },
      { src: "/music/Fallcore/2Velith.mp3", titleImg: "/next/image/Fallcore/Titles/2Velith.png" },
      { src: "/music/Fallcore/3Animated.mp3", titleImg: "/next/image/Fallcore/Titles/3Animated.png" },
      { src: "/music/Fallcore/4AFriend.mp3", titleImg: "/next/image/Fallcore/Titles/4AFriend.png" },
    ],
  },
  {
    mainImg: "/next/image/St4r/Components/St4rCF.png",
    pageImg: "/next/image/St4r/Components/St4rPAGE.png",
    buttons: [
      { on: "/next/image/St4r/Buttons/Button 1 ON.png", off: "/next/image/St4r/Buttons/Button 1 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 2 ON.png", off: "/next/image/St4r/Buttons/Button 2 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 3 ON.png", off: "/next/image/St4r/Buttons/Button 3 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 4 On.png", off: "/next/image/St4r/Buttons/Button 4 Off.png" },
      { on: "/next/image/St4r/Buttons/Button5On.png", off: "/next/image/St4r/Buttons/Button5Off.png" },
    ],
    playlist: [
      { src: "/music/St4r/1DesEtoiles.mp3", titleImg: "/next/image/St4r/Titles/1DesEtoiles.png" },
      { src: "/music/St4r/2Construction.mp3", titleImg: "/next/image/St4r/Titles/2Construction.png" },
      { src: "/music/St4r/3Escape.mp3", titleImg: "/next/image/St4r/Titles/3Escape.png" },
    ],
  },
];

// Preload helpers
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
  // --- STATE ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | 0 | 1 | 2 | 3 | 4>(null);
  const [pageOpen, setPageOpen] = useState(true);
  const [pageSeen, setPageSeen] = useState(projects.map(() => false));
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fadeBlack, setFadeBlack] = useState(0); // 0: transparent, 1: opaque
  const [fading, setFading] = useState(false); // block interactions while fading
  const [mainPageVisible, setMainPageVisible] = useState(false);
  const [mainPageDone, setMainPageDone] = useState(false); // only once, for Fragments
  const [titleLoaded, setTitleLoaded] = useState(true);
  const [prevTitleImg, setPrevTitleImg] = useState(projects[0].playlist[0].titleImg);
  const [isFadingTitle, setIsFadingTitle] = useState(false);

  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  // --- PRELOAD EVERYTHING ---
  useEffect(() => {
    async function doPreload() {
      const imageList: string[] = [
        ...projects.flatMap(proj => [
          ...proj.buttons.flatMap(btn => [btn.on, btn.off]),
          proj.mainImg,
          proj.pageImg,
          ...proj.playlist.map(track => track.titleImg),
        ]),
        "/next/image/Loading.png",
        "/next/image/MainPage.png"
      ];
      const audioList: string[] = [
        "/sounds/Button.mp3",
        "/sounds/PageON.mp3",
        "/sounds/PageOFF.mp3",
        ...projects.flatMap(proj => proj.playlist.map(track => track.src)),
      ];
      const total = imageList.length + audioList.length;
      let loaded = 0;
      function inc() {
        loaded += 1;
        setLoadingProgress(loaded / total);
      }
      await Promise.all([
        ...imageList.map(src => preloadImage(src).then(inc).catch(inc)),
        ...audioList.map(src => preloadHowl(src).then(inc).catch(inc)),
      ]);
      buttonSound.current = new Howl({ src: ["/sounds/Button.mp3"], html5: true });
      pageOnSound.current = new Howl({ src: ["/sounds/PageON.mp3"], html5: true });
      pageOffSound.current = new Howl({ src: ["/sounds/PageOFF.mp3"], html5: true });
      setLoading(false);
    }
    doPreload();
  }, []);

  // --- Prevent scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- Handle title image crossfade
  useEffect(() => {
    setIsFadingTitle(true);
    setTitleLoaded(false);
  }, [projectIdx, trackIdx]);
  function handleTitleLoad() {
    setTitleLoaded(true);
    setTimeout(() => {
      setPrevTitleImg(projects[projectIdx].playlist[trackIdx].titleImg);
      setIsFadingTitle(false);
    }, 350);
  }

  // --- Handle auto next on song end
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

  // --- Helper: fade out audio volume smoothly
  function fadeOutAudio(duration = 1200) {
    if (!audioRef.current) return Promise.resolve();
    const audio = audioRef.current;
    const initialVolume = audio.volume;
    const steps = 12;
    const stepTime = duration / steps;
    return new Promise<void>((resolve) => {
      let currStep = 0;
      function fadeStep() {
        currStep++;
        audio.volume = initialVolume * (1 - currStep / steps);
        if (currStep < steps) {
          setTimeout(fadeStep, stepTime);
        } else {
          audio.volume = 0;
          resolve();
        }
      }
      fadeStep();
    });
  }

  // --- Project transition with fade-to-black + preloading next project
  async function handleNextProject() {
    if (pageOpen || fading || loading) return;
    setFading(true);
    playButtonFx();
    setPressedIdx(3);

    // Fade in to black
    setFadeBlack(1);
    await new Promise(res => setTimeout(res, 600));
    await fadeOutAudio(600);

    // Get next project index
    const nextProject = (projectIdx + 1) % projects.length;

    // Preload next project images & audio
    const next = projects[nextProject];
    await Promise.all([
      preloadImage(next.mainImg),
      preloadImage(next.pageImg),
      ...next.buttons.map(btn => preloadImage(btn.on).catch(()=>{})),
      ...next.buttons.map(btn => preloadImage(btn.off).catch(()=>{})),
      ...next.playlist.map(track => preloadImage(track.titleImg).catch(()=>{})),
      ...next.playlist.map(track => preloadHowl(track.src).catch(()=>{})),
    ]);
    // Switch project & track
    setProjectIdx(nextProject);
    setTrackIdx(0);

    // Reset audio and overlay after fade
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
    }
    setTimeout(() => {
      setFadeBlack(0); // Fade out black
      setPressedIdx(null);
      setFading(false);
    }, 350);
  }

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
    if (pressedIdx === 0 || pageOpen || fading) return;
    playButtonFx();
    audioRef.current?.play();
    setPressedIdx(0);
  }
  function handlePause() {
    if (pressedIdx === 1 || pageOpen || fading) return;
    playButtonFx();
    audioRef.current?.pause();
    setPressedIdx(1);
  }
  function handleNextTrack() {
    if (pageOpen || fading) return;
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
  function handlePageBtn() {
    if (pageOpen || fading) return;
    playPageOnFx();
    setPageOpen(true);
  }
  function handlePageClose() {
    playPageOffFx();
    setPageOpen(false);
  }

  // Only show MainPage.png *once* after splash, before first interaction, above Fragments
  useEffect(() => {
    if (!mainPageDone && !loading && splashDone && projectIdx === 0) {
      setMainPageVisible(true);
    }
  }, [mainPageDone, loading, splashDone, projectIdx]);

  // --- PAGE LOGIC ---
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

        {/* --- Black Fade Overlay --- */}
        <div
          style={{
            pointerEvents: fadeBlack === 1 ? "auto" : "none",
            opacity: fadeBlack,
            position: "fixed",
            inset: 0,
            background: "#000",
            transition: "opacity 0.55s cubic-bezier(.7,0,.3,1)",
            zIndex: 20000,
          }}
        />

        {/* --- Splash Loading Screen --- */}
        {(loading || !splashDone) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#111",
              zIndex: 30000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "default" : "pointer",
              transition: "opacity 0.5s",
              opacity: splashFading ? 0 : 1,
            }}
            onClick={() => {
              if (!loading) {
                setSplashFading(true);
                pageOffSound.current?.play();
                setTimeout(() => {
                  setSplashDone(true);
                  setSplashFading(false);
                }, 500);
              }
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

            {/* Loading bar */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 4,
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                zIndex: 10001,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(loadingProgress * 100)}%`,
                  background: "#FFEB8A",
                  transition: "width 0.3s cubic-bezier(.7,0,.3,1)",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>
        )}

        {/* --- Main Page Overlay (only above Fragments, only once) --- */}
        {mainPageVisible && projectIdx === 0 && !mainPageDone && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              zIndex: 25000,
              background: "transparent", // allows to see behind!
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              setMainPageDone(true);
              setMainPageVisible(false);
              setPageOpen(true); // Show Fragments PAGE overlay after
            }}
          >
            <Image
              src="/next/image/MainPage.png"
              alt="Main Welcome"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 25001,
                userSelect: "none",
                pointerEvents: "none",
              }}
              priority
            />
          </div>
        )}

        {/* --- Player UI, only if not loading or in splash --- */}
        {(!loading && splashDone) && (
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
              zIndex: 10,
            }}
          >
            {/* --- Main frame (background+frame) --- */}
            <Image
              src={project.mainImg}
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

            {/* --- Title image CROSSFADE --- */}
            <Image
              src={prevTitleImg}
              alt="Previous Song Title"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 15,
                pointerEvents: "none",
                userSelect: "none",
                opacity: isFadingTitle ? 1 : 0,
                transition: "opacity 0.35s",
                position: "absolute",
              }}
              priority
            />
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
                opacity: titleLoaded ? 1 : 0,
                transition: "opacity 0.35s",
                position: "absolute",
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
            {project.buttons.map((img, idx) => (
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
            <button
              aria-label="Play"
              style={{
                ...topButtonPositions[0],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pageOpen || pressedIdx === 0 || fading ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handlePlay}
              tabIndex={0}
              disabled={pageOpen || pressedIdx === 0 || fading}
            />
            <button
              aria-label="Pause"
              style={{
                ...topButtonPositions[1],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pageOpen || pressedIdx === 1 || fading ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handlePause}
              tabIndex={0}
              disabled={pageOpen || pressedIdx === 1 || fading}
            />
            <button
              aria-label="Next Track"
              style={{
                ...topButtonPositions[2],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pageOpen || pressedIdx === 2 || fading ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handleNextTrack}
              tabIndex={0}
              disabled={pageOpen || pressedIdx === 2 || fading}
            />
            <button
              aria-label="Next Project"
              style={{
                ...topButtonPositions[3],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pageOpen || pressedIdx === 3 || fading ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handleNextProject}
              tabIndex={0}
              disabled={pageOpen || pressedIdx === 3 || fading}
            />
            <button
              aria-label="Show Project Page"
              style={{
                ...topButtonPositions[4],
                position: "absolute",
                background: "transparent",
                border: "none",
                cursor: pageOpen || fading ? "default" : "pointer",
                zIndex: 20,
              }}
              onClick={handlePageBtn}
              tabIndex={0}
              disabled={pageOpen || fading}
            />

            {/* --- Hidden audio player for actual music --- */}
            <audio ref={audioRef} hidden src={currentTrack.src} />
          </div>
        )}
      </main>
    </>
  );
}
