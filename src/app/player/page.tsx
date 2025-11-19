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
  links?: {
    href: string;
    left: string;
    top: string;
    width: string;
    height: string;
    label: string;
  }[];
};

const TOP_BUTTON_POSITIONS: TopButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "24%", top: "76%", width: "52%", height: "8.7%" },
  { left: "0%", top: "35%", width: "9%", height: "30%" }, // Button 6 (AboutMe)
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
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/Titles/1Lidge.png" },
      { src: "/music/Fragments/2DoubleCrossed.mp3", titleImg: "/next/image/Fragments/Titles/2Doublecross.png" },
      { src: "/music/Fragments/3Walz.mp3", titleImg: "/next/image/Fragments/Titles/3Walz.png" },
      { src: "/music/Fragments/4TheRabbit.mp3", titleImg: "/next/image/Fragments/Titles/4Rabbit.png" },
      { src: "/music/Fragments/5Orphan.mp3", titleImg: "/next/image/Fragments/Titles/5Orphan.png" },
    ],
    links: [
      {
        href: "https://iconiaavantgarde.com/victor-clavelly-les-fragments-collection//",
        left: "25%",
        top: "56%",
        width: "25%",
        height: "7%",
        label: "Fragments Site"
      },
       {
        href: "https://instagram.com/victorclavelly",
        left: "30%",
        top: "49%",
        width: "30%",
        height: "7%",
        label: "VC Instagram"
      }
    ]
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
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
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
    links: [
      {
        href: "https://ninofiliu.com/aggregate/",
        left: "33.5%",
        top: "43%",
        width: "19%",
        height: "5%",
        label: "Aggregate Site"
      },
      {
        href: "https://www.instagram.com/moulsssss/",
        left: "55%",
        top: "47%",
        width: "23%",
        height: "5%",
        label: "Moul Instagram"
      },
      {
        href: "https://distraction.fun/",
        left: "55%",
        top: "54%",
        width: "18%",
        height: "7%",
        label: "Distraction Site"
      }
    ]
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
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fallcore/1Shutter.mp3", titleImg: "/next/image/Fallcore/Titles/1shutter.png" },
      { src: "/music/Fallcore/2Velith.mp3", titleImg: "/next/image/Fallcore/Titles/2Velith.png" },
      { src: "/music/Fallcore/3Animated.mp3", titleImg: "/next/image/Fallcore/Titles/3Animated.png" },
      { src: "/music/Fallcore/4AFriend.mp3", titleImg: "/next/image/Fallcore/Titles/4AFriend.png" },
    ],
    links: [
      {
        href: "https://www.youtube.com/watch?v=9vqVzGTkRU4",
        left: "63%",
        top: "60%",
        width: "15%",
        height: "7%",
        label: "Fallcore Velith"
      }
    ]
  },
    {
    mainImg: "/next/image/Fallcore/Components/memoriaCF.png",
    pageImg: "/next/image/Fallcore/Components/memoriaFAGE.png",
    buttons: [
      { on: "/next/image/Memoria/Buttons/Button 1 ON.png", off: "/next/image/Memoria/Buttons/Button 1 Off.png" },
      { on: "/next/image/Memoria/Buttons/Button 2 ON.png", off: "/next/image/Memoria/Buttons/Button 2 Off.png" },
      { on: "/next/image/Memoria/Buttons/Button 3 ON.png", off: "/next/image/Memoria/Buttons/Button 3 Off.png" },
      { on: "/next/image/Memoria/Buttons/Button 4 ON.png", off: "/next/image/Memoria/Buttons/Button 4 Off.png" },
      { on: "/next/image/Memoria/Buttons/Button5On.png", off: "/next/image/Memoria/Buttons/Button5Off.png" },
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fallcore/1Shutter.mp3", titleImg: "/next/image/Fallcore/Titles/1shutter.png" },
      { src: "/music/Fallcore/2Velith.mp3", titleImg: "/next/image/Fallcore/Titles/2Velith.png" },
      { src: "/music/Fallcore/3Animated.mp3", titleImg: "/next/image/Fallcore/Titles/3Animated.png" },
      { src: "/music/Fallcore/4AFriend.mp3", titleImg: "/next/image/Fallcore/Titles/4AFriend.png" },
    ],
    links: [
      {
        href: "https://www.youtube.com/watch?v=9vqVzGTkRU4",
        left: "63%",
        top: "60%",
        width: "15%",
        height: "7%",
        label: "Fallcore Velith"
      }
    ]
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
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fallcore/1Shutter.mp3", titleImg: "/next/image/Fallcore/Titles/1shutter.png" },
      { src: "/music/Fallcore/2Velith.mp3", titleImg: "/next/image/Fallcore/Titles/2Velith.png" },
      { src: "/music/Fallcore/3Animated.mp3", titleImg: "/next/image/Fallcore/Titles/3Animated.png" },
      { src: "/music/Fallcore/4AFriend.mp3", titleImg: "/next/image/Fallcore/Titles/4AFriend.png" },
    ],
    links: [
      {
        href: "https://www.youtube.com/watch?v=9vqVzGTkRU4",
        left: "63%",
        top: "60%",
        width: "15%",
        height: "7%",
        label: "Fallcore Velith"
      }
    ]
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
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/St4r/1DesEtoiles.mp3", titleImg: "/next/image/St4r/Titles/1DesEtoiles.png" },
      { src: "/music/St4r/2Construction.mp3", titleImg: "/next/image/St4r/Titles/2Construction.png" },
      { src: "/music/St4r/3Escape.mp3", titleImg: "/next/image/St4r/Titles/3Escape.png" },
    ],
    links: [
      {
        href: "https://www.lefresnoy.net/en/exposition/1949/oeuvre/1900/",
        left: "60%",
        top: "44%",
        width: "15%",
        height: "6%",
        label: "St4r Fresnoy"
      },
       {
        href: "https://www.instagram.com/juliatarissan/",
        left: "45%",
        top: "58%",
        width: "31%",
        height: "6%",
        label: "St4r Julia"
      }
    ]
  },
];

const BUTTON_LABELS = [
  "Play", "Pause", "Next Track", "Next Project", "Show Project Page", "Show About Me Page"
];

// --- Preload helper (for button images only) ---
function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;
  });
}

// --- Subcomponents ---
const ButtonHotzone = memo(function ButtonHotzone({
  idx, pos, onClick, pressed, disabled, blackFade
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
    cursor: disabled || pressed || (idx === 3 && blackFade) ? "default" : "pointer",
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

// --- Main Component ---
export default function Home() {
  // --- State ---
  const audioRef = useRef<HTMLAudioElement>(null);
  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [pressedIdx, setPressedIdx] = useState<null | number>(null);
  const [aboutMeOpen, setAboutMeOpen] = useState(false);

  // overlay state: always open on project switch
  const [pageOpen, setPageOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [mainPageLoaded, setMainPageLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [blackFade, setBlackFade] = useState(false);
  const [blackOpacity, setBlackOpacity] = useState(0);
  const [mainPageVisible, setMainPageVisible] = useState(false);

  // --- SFX ---
  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  // --- Data shortcuts ---
  const project = projects[projectIdx];
  const currentTrack = project.playlist[trackIdx];

  // --- Preload only button ON/OFF images and current title image ---
  useEffect(() => {
    let isMounted = true;
    async function doPreload() {
      const buttonImages = [
        ...projects.flatMap(p => [p.mainImg, p.pageImg]),
        ...project.buttons.flatMap(btn => [btn.on, btn.off]),
        currentTrack.titleImg,
        "/next/image/Loading.png",
        "/next/image/MainPage.png",
        "/next/image/AboutMe.png",
      ];

      let loaded = 0;
      const inc = () => { loaded++; if (isMounted) setLoadingProgress(loaded / buttonImages.length); };
      await Promise.all(buttonImages.map(src => preloadImage(src).then(inc).catch(inc)));
      if (!isMounted) return;
      // Only preload SFX, not music tracks yet
      buttonSound.current = new Howl({ src: ["/sounds/Button.mp3"], html5: true });
      pageOnSound.current = new Howl({ src: ["/sounds/PageON.mp3"], html5: true });
      pageOffSound.current = new Howl({ src: ["/sounds/PageOFF.mp3"], html5: true });
      setLoading(false);
    }
    doPreload();
    return () => { isMounted = false; };
    // Only run on first render (button images only)
    // eslint-disable-next-line
  }, []);

  // --- Lock scroll while overlay is open ---
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // --- Always show page overlay when switching projects ---
  useEffect(() => {
    setPageOpen(true);
  }, [projectIdx]);

  // --- SPLASH (lock until everything is loaded) ---
  const handleSplashClick = useCallback(() => {
    if (!loading && mainPageLoaded) {
      setSplashFading(true);
      setTimeout(() => {
        setSplashDone(true);
        setSplashFading(false);
        pageOnSound.current?.play();
        setMainPageVisible(true);
      }, 500);
    }
  }, [loading, mainPageLoaded]);

  // --- Fade and switch project ---
  const handleNextProject = useCallback(() => {
    if (pageOpen || blackFade || aboutMeOpen) return;
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
  }, [pageOpen, blackFade, projectIdx, aboutMeOpen]);

  // --- Main page close ---
  const handleCloseMainPage = useCallback(() => {
    pageOffSound.current?.play();
    setMainPageVisible(false);
  }, []);

  // --- Button Handlers ---
  const buttonHandlers = [
    // Play
    useCallback(() => {
      if (pressedIdx === 0 || pageOpen || aboutMeOpen) return;
      buttonSound.current?.play();
      setPressedIdx(0);

      if (audioRef.current && audioRef.current.readyState > 2) {
        audioRef.current.volume = 1;
        audioRef.current.play();
      } else if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.oncanplaythrough = () => {
          audioRef.current?.play();
        };
      }
    }, [pressedIdx, pageOpen, aboutMeOpen]),
    // Pause
    useCallback(() => {
      if (pressedIdx === 1 || pageOpen || aboutMeOpen) return;
      buttonSound.current?.play();
      audioRef.current?.pause();
      setPressedIdx(1);
    }, [pressedIdx, pageOpen, aboutMeOpen]),
    // Next Track
    useCallback(() => {
      if (pageOpen || aboutMeOpen) return;
      buttonSound.current?.play();
      setPressedIdx(2);

      setTimeout(() => {
        const nextIdx = (trackIdx + 1) % project.playlist.length;
        setTrackIdx(nextIdx);
        if (audioRef.current) {
          audioRef.current.src = project.playlist[nextIdx].src;
          audioRef.current.load();
        }
        setPressedIdx(null);
      }, 300); // Quicker feedback
    }, [pageOpen, trackIdx, project, aboutMeOpen]),
    // Next Project
    handleNextProject,
    // Show Project Page
    useCallback(() => {
      if (pageOpen || aboutMeOpen) return;
      pageOnSound.current?.play();
      setPageOpen(true);
    }, [pageOpen, aboutMeOpen]),
    // Show About Me
    useCallback(() => {
      if (aboutMeOpen) return;
      pageOnSound.current?.play();
      setAboutMeOpen(true);
    }, [aboutMeOpen]),
  ];

  // --- Render ---
  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, orientation=portrait" />
        <link rel="preload" as="image" href="/next/image/MainPage.png" />
        <link rel="preload" as="image" href="/next/image/AboutMe.png" />
      </Head>
    <main className="fixed inset-0 flex items-center justify-center bg-[#19191b]" style={{ minHeight: "100vh", minWidth: "100vw", position: "relative" }}>
  {/* --- Spherical Glow BG --- */}
  <div
    style={{
      position: "absolute",
      left: "46%",
      top: "30%",
      width: "60vw",
      height: "60vw",
      maxWidth: "600px",
      maxHeight: "600px",
      transform: "translate(-50%, -50%)",
      background: "radial-gradient(circle, #d8ccaf55 0%, #19191b 70%, #19191b 100%)",
      filter: "blur(80px)",
      opacity: 0.7,
      zIndex: 0,
      pointerEvents: "none",
      userSelect: "none",
    }}
    aria-hidden
  />

        {/* --- FADE NOIR FULLSCREEN --- */}
        {blackFade && (
          <div
            style={{
              position: "fixed", inset: 0, background: "black",
              opacity: blackOpacity, pointerEvents: "auto",
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
                position: "fixed", inset: 0, background: "#111", zIndex: 10000,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: loading || !mainPageLoaded ? "default" : "pointer",
                transition: "opacity 0.5s", opacity: splashFading ? 0 : 1,
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
                  width: "min(98vw, 430px)", height: "auto", objectFit: "contain",
                  maxHeight: "620px", maxWidth: "430px",
                  userSelect: "none", pointerEvents: "none",
                }}
              />
              {/* Minimal loading bar */}
              <div
                style={{
                  position: "absolute", left: 0, bottom: 0, height: 4, width: "100%",
                  background: "rgba(255,255,255,0.06)", zIndex: 10001,
                }}
              >
                <div
                  style={{
                    height: "100%", width: `${Math.round(loadingProgress * 100)}%`,
                    background: "#867d50a8",
                    transition: "width 0.3s cubic-bezier(.7,0,.3,1)", borderRadius: 2,
                  }}
                />
              </div>
              {/* Preload MainPage & AboutMe as invisible images */}
              <Image
                src="/next/image/MainPage.png"
                alt=""
                style={{ display: "none" }}
                width={10} height={10} priority onLoad={() => setMainPageLoaded(true)}
              />
              <Image
                src="/next/image/AboutMe.png"
                alt=""
                style={{ display: "none" }}
                width={10} height={10} priority
              />
              {(!loading && !mainPageLoaded) && (
                <div
                  style={{
                    position: "absolute", top: "55%", width: "100%",
                    textAlign: "center", color: "#fff", fontSize: 16,
                  }}
                >Loading main page image...</div>
              )}
            </div>
          )}

          {/* --- Main frame (background+frame) --- */}
          <Image
            src={project.mainImg}
            alt="Main Visual Frame"
            fill
            style={{
              objectFit: "contain", objectPosition: "center",
              background: "transparent", zIndex: 2, pointerEvents: "none", userSelect: "none",
            }}
            priority
          />

          {/* --- Title image --- */}
          <Image
            src={project.playlist[trackIdx].titleImg}
            alt="Song Title"
            fill
            style={{
              objectFit: "contain", objectPosition: "center",
              zIndex: 16, pointerEvents: "none", userSelect: "none",
              opacity: 1, transition: "none", position: "absolute",
            }}
            priority
          />

          {/* --- PAGE OVERLAY: always same size as frame --- */}
          {pageOpen && (
            <div
              style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                zIndex: 30, cursor: "pointer",
              }}
              onClick={() => {
                pageOffSound.current?.play();
                setPageOpen(false);
              }}
            >
              <Image
                src={project.pageImg}
                alt="Project Page"
                fill
                style={{
                  objectFit: "contain", objectPosition: "center",
                  zIndex: 31, pointerEvents: "none", userSelect: "none",
                }}
                priority
              />
              {/* --- Dynamic Overlay Links --- */}
              {(project.links ?? []).map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: "absolute",
                    left: link.left,
                    top: link.top,
                    width: link.width,
                    height: link.height,
                    zIndex: 32,
                    cursor: "help",
                    display: "block",
                  }}
                  onClick={e => e.stopPropagation()}
                  aria-label={link.label}
                />
              ))}
            </div>
          )}

          {/* --- MAINPAGE overlay just after splash, once --- */}
          {mainPageVisible && (
            <div
              style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                zIndex: 10001, background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              onClick={handleCloseMainPage}
            >
              <Image
                src="/next/image/MainPage.png"
                alt="MainPage"
                fill
                style={{
                  objectFit: "contain", objectPosition: "center",
                  zIndex: 10002, pointerEvents: "none", userSelect: "none",
                }}
                priority
              />
            </div>
          )}

          {/* --- ABOUT ME overlay --- */}
          {aboutMeOpen && (
            <div
              style={{
                position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                zIndex: 10003, background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div
                onClick={() => {
                  pageOffSound.current?.play();
                  setAboutMeOpen(false);
                }}
                style={{
                  position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
                  background: "transparent", zIndex: 10003,
                }}
              />
              <Image
                src="/next/image/AboutMe.png"
                alt="About Me"
                fill
                style={{
                  objectFit: "contain", objectPosition: "center",
                  zIndex: 10004, pointerEvents: "none", userSelect: "none",
                }}
                priority
              />
              {/* EMAIL BUTTON */}
              <a
                href="mailto:igordubreucq.pro@gmail.com"
                style={{
                  position: "absolute", left: "53%", top: "51%",
                  width: "15%", height: "7%", zIndex: 10005, cursor: "pointer", display: "block",
                }}
                onClick={e => e.stopPropagation()}
                aria-label="Email"
              />
              {/* INSTAGRAM BUTTON */}
              <a
                href="https://instagram.com/migu.exe"
                target="_blank" rel="noopener noreferrer"
                style={{
                  position: "absolute", left: "43%", top: "44%",
                  width: "24%", height: "7%", zIndex: 10005, cursor: "pointer", display: "block",
                }}
                onClick={e => e.stopPropagation()}
                aria-label="Instagram"
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
                objectFit: "contain", objectPosition: "center",
                zIndex: 11, pointerEvents: "none", userSelect: "none",
              }}
              priority={idx === 0}
            />
          ))}

          {/* --- Button Hotzones --- */}
          {TOP_BUTTON_POSITIONS.map((pos, idx) => (
            <ButtonHotzone
              key={idx}
              idx={idx}
              pos={pos}
              onClick={buttonHandlers[idx]}
              pressed={pressedIdx === idx}
              disabled={pageOpen || aboutMeOpen}
              blackFade={blackFade}
            />
          ))}

          {/* --- Hidden audio player --- */}
          <audio
            ref={audioRef}
            hidden
            src={currentTrack.src}
            onEnded={() => {
              const nextIdx = (trackIdx + 1) % project.playlist.length;
              setTrackIdx(nextIdx);
              setPressedIdx(null);

              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.load();

                  audioRef.current.oncanplaythrough = () => {
                    audioRef.current?.play().then(() => setPressedIdx(0)).catch(() => setPressedIdx(null));
                    audioRef.current!.oncanplaythrough = null;
                  };
                }
              }, 30);
            }}
          />
        </div>
      </main>
    </>
  );
}

