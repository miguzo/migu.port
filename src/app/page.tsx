"use client";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import Image from "next/image";
import Head from "next/head";
import { Howl } from "howler";

// --- Types & Data ---
type ButtonImage = { on: string; off: string };
type TopButtonPos = { left: string; top: string; width: string; height: string };
type Project = {
  pageImg: string;
  mainImg: string;
  buttons: ButtonImage[];
  playlist: { src: string; titleImg: string }[];
};

const TOP_BUTTON_POSITIONS: TopButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "24%", top: "76%", width: "52%", height: "8.7%" },
  // Button 6 (customize position as you want)
  { left: "45%", top: "85%", width: "10%", height: "5%" },
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
      { on: "/next/image/Fragments/Buttons/Button6On.png", off: "/next/image/Fragments/Buttons/Button6Off.png" },
    ],
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/Titles/1Lidge.png" },
      { src: "/music/Fragments/2DoubleCrossed.mp3", titleImg: "/next/image/Fragments/Titles/2Doublecross.png" },
      { src: "/music/Fragments/3Walz.mp3", titleImg: "/next/image/Fragments/Titles/3Walz.png" },
      { src: "/music/Fragments/4TheRabbit.mp3", titleImg: "/next/image/Fragments/Titles/4Rabbit.png" },
      { src: "/music/Fragments/5Orphan.mp3", titleImg: "/next/image/Fragments/Titles/5Orphan.png" },
    ],
  },
  // ...repeat for other projects (as in your data above, all 6 button images per project)
  // Omitted here for brevity
];

const BUTTON_LABELS = [
  "Play", "Pause", "Next Track", "Next Project", "Show Project Page", "Show Custom Page"
];

// --- Helpers ---
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

// --- Subcomponents ---
const ButtonHotzone = memo(function ButtonHotzone({
  idx,
  pos,
  onClick,
  pressed,
  disabled,
  blackFade,
}: {
  idx: number;
  pos: TopButtonPos;
  onClick: () => void;
  pressed: boolean;
  disabled: boolean;
  blackFade: boolean;
}) {
  const style = {
    ...pos,
    position: "absolute" as const,
    background: "transparent",
    border: "none",
    cursor:
      disabled || pressed || (idx === 3 && blackFade) ? "default" : "pointer",
    zIndex: 20,
  };
  return (
    <button
      aria-label={BUTTON_LABELS[idx]}
      style={style}
      onClick={onClick}
      disabled={disabled || pressed || (idx === 3 && blackFade)}
      tabIndex={-1}
      type="button"
    />
  );
});

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | number>(null);
  const [customPageOpen, setCustomPageOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [titleLoaded, setTitleLoaded] = useState(true);
  const [prevTitleImg, setPrevTitleImg] = useState(projects[0].playlist[0].titleImg);
  const [isFadingTitle, setIsFadingTitle] = useState(false);
  const [blackFade, setBlackFade] = useState(false);
  const [blackOpacity, setBlackOpacity] = useState(0);
  const [mainPageVisible, setMainPageVisible] = useState(false);
  const [mainPageLoaded, setMainPageLoaded] = useState(false);

  // --- SFX ---
  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  // --- Preload ---
  useEffect(() => {
    let isMounted = true;
    async function doPreload() {
      const imageList: string[] = [
        ...projects.flatMap(proj => [
          ...proj.buttons.flatMap(btn => [btn.on, btn.off]),
          proj.mainImg,
          proj.pageImg,
          ...proj.playlist.map(track => track.titleImg),
        ]),
        "/next/image/Loading.png",
        "/next/image/MainPage.png",
        "/next/image/Fragments/Components/CustomPage.png",
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
        if (isMounted) setLoadingProgress(loaded / total);
      }
      await Promise.all([
        ...imageList.map(src => preloadImage(src).then(inc).catch(inc)),
        ...audioList.map(src => preloadHowl(src).then(inc).catch(inc)),
      ]);
      if (!isMounted) return;
      buttonSound.current = new Howl({ src: ["/sounds/Button.mp3"], html5: true });
      pageOnSound.current = new Howl({ src: ["/sounds/PageON.mp3"], html5: true });
      pageOffSound.current = new Howl({ src: ["/sounds/PageOFF.mp3"], html5: true });
      setLoading(false);
    }
    doPreload();
    return () => { isMounted = false; };
  }, []);

  // --- Lock scroll ---
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- Splash handling ---
  const handleSplashClick = useCallback(() => {
    if (!loading && mainPageLoaded) {
      setSplashFading(true);
      setTimeout(() => {
        setSplashDone(true);
        setSplashFading(false);
        setMainPageVisible(true);
      }, 500);
    }
  }, [loading, mainPageLoaded]);

  // --- Next project with fade ---
  const handleNextProject = useCallback(async () => {
    if (pageOpen || customPageOpen || blackFade) return;
    buttonSound.current?.play();
    setPressedIdx(3);
    setBlackFade(true);
    setBlackOpacity(1);

    setTimeout(() => {
      const nextProject = (projectIdx + 1) % projects.length;
      setProjectIdx(nextProject);
      setTrackIdx(0);
      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current.src = projects[nextProject].playlist[0].src;
        audioRef.current.load();
      }
      setTimeout(() => {
        setBlackOpacity(0);
        setTimeout(() => setBlackFade(false), 700);
        setPressedIdx(null);
      }, 700);
    }, 500);
  }, [pageOpen, customPageOpen, blackFade, projectIdx]);

  // --- Title crossfade ---
  useEffect(() => {
    setIsFadingTitle(true);
    setTitleLoaded(false);
  }, [projectIdx]);

  function handleTitleLoad() {
    setTitleLoaded(true);
    setTimeout(() => {
      setPrevTitleImg(projects[projectIdx].playlist[trackIdx].titleImg);
      setIsFadingTitle(false);
    }, 350);
  }

  useEffect(() => {
    setPrevTitleImg(projects[projectIdx].playlist[trackIdx].titleImg);
    setIsFadingTitle(false);
    setTitleLoaded(true);
  }, [trackIdx]);

  // --- Main page close ---
  const handleCloseMainPage = useCallback(() => setMainPageVisible(false), []);

  // --- Button Handlers ---
  const buttonHandlers = [
    // Play
    useCallback(() => {
      if (pressedIdx === 0 || pageOpen || customPageOpen) return;
      buttonSound.current?.play();
      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current
          .play()
          .then(() => setPressedIdx(0))
          .catch((e) => {
            console.warn("Erreur lecture audio (mobile)", e);
            setPressedIdx(0);
          });
      } else {
        setPressedIdx(0);
      }
    }, [pressedIdx, pageOpen, customPageOpen]),
    // Pause
    useCallback(() => {
      if (pressedIdx === 1 || pageOpen || customPageOpen) return;
      buttonSound.current?.play();
      audioRef.current?.pause();
      setPressedIdx(1);
    }, [pressedIdx, pageOpen, customPageOpen]),
    // Next Track
    useCallback(() => {
      if (pageOpen || customPageOpen) return;
      buttonSound.current?.play();
      setPressedIdx(2);
      setTimeout(() => {
        const nextIdx = (trackIdx + 1) % project.playlist.length;
        setTrackIdx(nextIdx);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
        setPressedIdx(null);
      }, 600);
    }, [pageOpen, customPageOpen, trackIdx, project.playlist.length]),
    // Next Project
    handleNextProject,
    // Show Project Page
    useCallback(() => {
      if (pageOpen || customPageOpen) return;
      pageOnSound.current?.play();
      setPageOpen(true);
    }, [pageOpen, customPageOpen]),
    // Show Custom Page
    useCallback(() => {
      if (customPageOpen || pageOpen) return;
      setCustomPageOpen(true);
    }, [customPageOpen, pageOpen]),
  ];

  // --- Render ---
  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, orientation=portrait" />
        {/* browser-level preload for critical overlays */}
        <link rel="preload" as="image" href="/next/image/MainPage.png" />
        <link rel="preload" as="image" href="/next/image/Fragments/Components/CustomPage.png" />
      </Head>
      <main
        className="fixed inset-0 flex justify-center bg-[#19191b]"
        style={{ minHeight: "100vh", minWidth: "100vw" }}
      >
        {/* --- FADE NOIR FULLSCREEN --- */}
        {blackFade && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "black",
              opacity: blackOpacity,
              pointerEvents: "auto",
              transition: "opacity 0.7s cubic-bezier(.7,0,.3,1)",
              zIndex: 99999,
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
          {/* --- Loading Splash --- */}
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
                cursor: loading || !mainPageLoaded ? "default" : "pointer",
                transition: "opacity 0.5s",
                opacity: splashFading ? 0 : 1,
              }}
              onClick={handleSplashClick}
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
              {/* PATCH: Preload MainPage.png and track when loaded */}
              <Image
                src="/next/image/MainPage.png"
                alt=""
                style={{ display: "none" }}
                width={10}
                height={10}
                priority
                onLoad={() => setMainPageLoaded(true)}
              />
              {/* PATCH: Optionally show a spinner if everything else is loaded except MainPage.png */}
              {(!loading && !mainPageLoaded) && (
                <div
                  style={{
                    position: "absolute",
                    top: "55%",
                    width: "100%",
                    textAlign: "center",
                    color: "#fff",
                    fontSize: 16,
                  }}
                >
                  Loading main page image...
                </div>
              )}
            </div>
          )}

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
          {isFadingTitle ? (
            <>
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
                  opacity: 1,
                  transition: "opacity 0.35s",
                  position: "absolute",
                }}
                priority
              />
              <Image
                src={projects[projectIdx].playlist[trackIdx].titleImg}
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
            </>
          ) : (
            <Image
              src={projects[projectIdx].playlist[trackIdx].titleImg}
              alt="Song Title"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 16,
                pointerEvents: "none",
                userSelect: "none",
                opacity: 1,
                transition: "none",
                position: "absolute",
              }}
              priority
            />
          )}

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
              onClick={() => setPageOpen(false)}
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

          {/* --- MAINPAGE overlay just after splash, once --- */}
          {mainPageVisible && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 10001,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={handleCloseMainPage}
            >
              <Image
                src="/next/image/MainPage.png"
                alt="MainPage"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  zIndex: 10002,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                priority
              />
            </div>
          )}

          {/* --- CUSTOM PAGE overlay (global, always same image) --- */}
          {customPageOpen && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 10003,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => setCustomPageOpen(false)}
            >
              <Image
                src="/next/image/Fragments/Components/AboutMe.png"
                alt="Custom Page"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  zIndex: 10004,
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

          {/* --- Button Hotzones (top + 5th + 6th) --- */}
          {TOP_BUTTON_POSITIONS.map((pos, idx) => (
            <ButtonHotzone
              key={idx}
              idx={idx}
              pos={pos}
              onClick={buttonHandlers[idx]}
              pressed={pressedIdx === idx}
              disabled={pageOpen || customPageOpen}
              blackFade={blackFade}
            />
          ))}

          {/* --- Hidden audio player for actual music --- */}
          <audio ref={audioRef} hidden src={currentTrack.src} />
        </div>
      </main>
    </>
  );
}
