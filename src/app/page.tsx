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
  frameImg: string;
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
    bg: "/next/image/Fragments/Portrait.png",
    pageImg: "/next/image/Fragments/FragmentsPAGE.png",
    frameImg: "/next/image/Fragments/FragmentsCF.png",
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/1Lidge.png" },
      { src: "/music/Fragments/2DoubleCrossed.mp3", titleImg: "/next/image/Fragments/2Doublecross.png" },
      { src: "/music/Fragments/3Walz.mp3", titleImg: "/next/image/Fragments/3Walz.png" },
      { src: "/music/Fragments/4TheRabbit.mp3", titleImg: "/next/image/Fragments/4Rabbit.png" },
      { src: "/music/Fragments/5Orphan.mp3", titleImg: "/next/image/Fragments/5Orphan.png" },
    ],
  },
  {
    bg: "/next/image/Aggragate/Aggragate.png",
    pageImg: "/next/image/Aggragate/AggragatePAGE.png",
    frameImg: "/next/image/Aggragate/AggragateCF.png",
    playlist: [
      { src: "/music/Aggragate/1HighRiver.mp3", titleImg: "/next/image/Aggragate/1HighRiver.png" },
      { src: "/music/Aggragate/2AmongTheStorm.mp3", titleImg: "/next/image/Aggragate/2AmongTheStorm.png" },
      { src: "/music/Aggragate/3Spectacle.mp3", titleImg: "/next/image/Aggragate/3Spectacle.png" },
      { src: "/music/Aggragate/4Arrest.mp3", titleImg: "/next/image/Aggragate/4Arrest.png" },
      { src: "/music/Aggragate/5NoOnesEnnemy.mp3", titleImg: "/next/image/Aggragate/5NoOnesEnnemy.png" },
      { src: "/music/Aggragate/6PromessField.mp3", titleImg: "/next/image/Aggragate/6PromessField.png" },
      { src: "/music/Aggragate/7TheArena.mp3", titleImg: "/next/image/Aggragate/7TheArena.png" },
      { src: "/music/Aggragate/8ADisaster.mp3", titleImg: "/next/image/Aggragate/8ADisaster.png" },
      { src: "/music/Aggragate/9OfRustAndMirror.mp3", titleImg: "/next/image/Aggragate/9OfRustAndMirror.png" },
    ],
  },
   {
    bg: "/next/image/St4r/St4r.png",
    pageImg: "/next/image/Aggragate/AggragatePAGE.png",
    frameImg: "/next/image/St4r/St4rCF.png",
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/1Lidge.png" },
  
    ],
  },
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
  const [pageOpen, setPageOpen] = useState(true);
  const [pageSeen, setPageSeen] = useState(() => projects.map(() => false));
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // --- Crossfade overlay for playlist switch ---
  const [playlistFade, setPlaylistFade] = useState<{ visible: boolean; opacity: number }>({ visible: false, opacity: 0 });
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- Crossfade for title image ---
  const [titleLoaded, setTitleLoaded] = useState(true);
  const [prevTitleImg, setPrevTitleImg] = useState(projects[0].playlist[0].titleImg);
  const [isFadingTitle, setIsFadingTitle] = useState(false);

  // --- SFX ---
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
          proj.frameImg,
          ...proj.playlist.map(track => track.titleImg),
        ]),
        "/next/image/Loading.png",
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

  // --- Cleanup fadeTimeout ---
  useEffect(() => {
    return () => {
      if (fadeTimeout.current) clearTimeout(fadeTimeout.current);
    };
  }, []);

  // --- BODY LOCK ---
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

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

  // --- Crossfade logic for title image ---
  useEffect(() => {
    setIsFadingTitle(true);
    setTitleLoaded(false);
  }, [projectIdx, trackIdx]);
  function handleTitleLoad() {
    setTitleLoaded(true);
    setTimeout(() => {
      setPrevTitleImg(projects[projectIdx].playlist[trackIdx].titleImg);
      setIsFadingTitle(false);
    }, 350); // match fade duration
  }

  // --- PAGE OVERLAY SEEN LOGIC ---
  useEffect(() => {
    setPageSeen(seen => seen.map((s, i) => (i === 0 ? true : s)));
  }, []);

  useEffect(() => {
    if (!pageSeen[projectIdx]) {
      setPageOpen(true);
      setPageSeen(seen =>
        seen.map((s, i) => (i === projectIdx ? true : s))
      );
    }
    // eslint-disable-next-line
  }, [projectIdx]);

  // --- Helper: fade out audio volume smoothly ---
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
  async function handleNextProject() {
    if (pageOpen || playlistFade.visible) return;
    playButtonFx();
    setPressedIdx(3);

    setPlaylistFade({ visible: true, opacity: 0 });
    setTimeout(() => setPlaylistFade({ visible: true, opacity: 1 }), 10);

    if (fadeTimeout.current) clearTimeout(fadeTimeout.current);

    // Start fading audio now, don't wait (do in parallel with overlay fade)
    fadeOutAudio(1200);

    fadeTimeout.current = setTimeout(() => {
      const nextProject = (projectIdx + 1) % projects.length;
      setProjectIdx(nextProject);
      setTrackIdx(0);

      // Restore volume for new track
      if (audioRef.current) audioRef.current.volume = 1;

      setPlaylistFade({ visible: true, opacity: 1 });
      setTimeout(() => setPlaylistFade({ visible: true, opacity: 0 }), 30);

      fadeTimeout.current = setTimeout(() => {
        setPlaylistFade({ visible: false, opacity: 0 });
        setPressedIdx(null);
      }, 1500);
    }, 1500);
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
        {/* --- Playlist FADE Overlay: covers full screen --- */}
        {playlistFade.visible && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "black",
              opacity: playlistFade.opacity,
              pointerEvents: "auto",
              transition: "opacity 1.5s cubic-bezier(.7,0,.3,1)",
              zIndex: 10001,
            }}
          />
        )}

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

              {/* Minimal loading bar */}
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

          {/* --- Project BG --- */}
          <Image
            src={project.bg}
            alt="Project Background"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
            priority
          />

          {/* --- Frame (dynamic per project) --- */}
          <Image
            src={project.frameImg}
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
          {/* Previous title */}
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
          {/* Current/new title */}
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
