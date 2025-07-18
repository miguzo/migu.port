"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { Howl } from "howler";

// ---------- TYPE DEFINITIONS ----------
type ButtonImage = { on: string; off: string };
type TopButtonPos = { left: string; top: string; width: string; height: string };
type Project = {
  pageImg: string;
  mainImg: string;
  buttons: ButtonImage[];
  playlist: { src: string; titleImg: string }[];
};

// ---------- DATA (Met à jour les chemins/images si besoin) ----------
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
      { on: "/next/image/Fallcore/Buttons/Button 4 On.png", off: "/next/image/Fallcore/Buttons/Button 4 Off.png" },
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

// ... Project/button data (identique à avant, je n'y touche pas pour l'exemple)
// Copie ici exactement le tableau projects[] comme dans ton script, rien à changer

// ... (Préload helpers comme avant)
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

  // NEW : main welcome page
  const [mainPageVisible, setMainPageVisible] = useState(false);

  // FADE
  const [fade, setFade] = useState<"none" | "in" | "out">("none");
  const [fadeBlack, setFadeBlack] = useState(true); // for true overlay black at start
  const fadeTimeout = useRef<NodeJS.Timeout | null>(null);

  // Waits
  const [mainImgLoaded, setMainImgLoaded] = useState(false);
  const [titleImgLoaded, setTitleImgLoaded] = useState(false);

  // Title crossfade
  const [titleLoaded, setTitleLoaded] = useState(true);
  const [prevTitleImg, setPrevTitleImg] = useState(projects[0].playlist[0].titleImg);
  const [isFadingTitle, setIsFadingTitle] = useState(false);

  // SFX
  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  // --- PRELOAD ---
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
        "/next/image/MainPage.png",
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

  // CLEANUP
  useEffect(() => () => { if (fadeTimeout.current) clearTimeout(fadeTimeout.current); }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // Track changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = projects[projectIdx].playlist[trackIdx].src;
    audioRef.current.load();
  }, [projectIdx, trackIdx]);

  // Audio ended: auto next
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

  // Title crossfade
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

  // PAGE OVERLAY SEEN
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
  }, [projectIdx, pageSeen]);

  // Reset image loaded flags on project/track change
  useEffect(() => {
    setMainImgLoaded(false);
    setTitleImgLoaded(false);
  }, [projectIdx, trackIdx]);

  // --------- FADE LOGIC ---------
  // (1) At load, when loading screen closes, fade out to reveal project + show MainPage if first
  useEffect(() => {
    if (!loading && splashDone) {
      setFade("in");
      setFadeBlack(true);
      setTimeout(() => setFade("none"), 600);
      if (projectIdx === 0 && !mainPageVisible) {
        setTimeout(() => setMainPageVisible(true), 700);
      }
    }
  }, [loading, splashDone]);

  // (2) On next project: stays black until images are loaded
  useEffect(() => {
    if (
      fade === "out" &&
      mainImgLoaded &&
      titleImgLoaded
    ) {
      setTimeout(() => {
        setFade("in");
        setTimeout(() => setFade("none"), 600);
      }, 150); // Optionally adjust this timing
    }
  }, [fade, mainImgLoaded, titleImgLoaded]);

  // Fade functions
  function startFadeOut() {
    setFade("out");
    setFadeBlack(true);
  }
  function endFade() {
    setFade("in");
    setTimeout(() => setFade("none"), 600);
  }

  // ---- Player controls (identique à avant)
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
  function playButtonFx() { buttonSound.current?.stop(); buttonSound.current?.play(); }
  function playPageOnFx() { pageOnSound.current?.stop(); pageOnSound.current?.play(); }
  function playPageOffFx() { pageOffSound.current?.stop(); pageOffSound.current?.play(); }

  function handlePlay() {
    if (pressedIdx === 0 || pageOpen || fade !== "none" || mainPageVisible) return;
    playButtonFx();
    audioRef.current?.play();
    setPressedIdx(0);
  }
  function handlePause() {
    if (pressedIdx === 1 || pageOpen || fade !== "none" || mainPageVisible) return;
    playButtonFx();
    audioRef.current?.pause();
    setPressedIdx(1);
  }
  function handleNextTrack() {
    if (pageOpen || fade !== "none" || mainPageVisible) return;
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
    if (pageOpen || fade !== "none" || mainPageVisible) return;
    playButtonFx();
    setPressedIdx(3);
    startFadeOut();
    await fadeOutAudio(1200);
    setTimeout(() => {
      const nextProject = (projectIdx + 1) % projects.length;
      setProjectIdx(nextProject);
      setTrackIdx(0);
      if (audioRef.current) audioRef.current.volume = 1;
      // Wait for images (effect above will fade back in)
    }, 600);
  }
  function handlePageBtn() {
    if (pageOpen || fade !== "none" || mainPageVisible) return;
    playPageOnFx();
    setPageOpen(true);
  }
  function handlePageClose() {
    playPageOffFx();
    setPageOpen(false);
  }

  // ----
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
        {/* --- LOADING SCREEN --- */}
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

        {/* --- BLACK FADE OVERLAY --- */}
        {(fade === "out" || fade === "in") && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "#000",
              opacity: fade === "out" ? 1 : 0,
              pointerEvents: "auto",
              zIndex: 9999,
              transition: "opacity 0.6s cubic-bezier(.7,0,.3,1)",
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
            pointerEvents: (fade === "out" || loading || mainPageVisible) ? "none" : "auto",
          }}
        >
          {/* --- Main frame (background+frame) --- */}
          <Image
            src={project.mainImg}
            alt="Main Visual Frame"
            fill
            onLoad={() => setMainImgLoaded(true)}
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
            onLoad={() => {
              handleTitleLoad();
              setTitleImgLoaded(true);
            }}
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

          {/* --- PAGE OVERLAY --- */}
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

        {/* -------- MAIN PAGE OVERLAY --------- */}
        {mainPageVisible && projectIdx === 0 && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0)", // transparent
              zIndex: 11000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "opacity 0.3s",
            }}
            onClick={() => setMainPageVisible(false)}
          >
            <Image
              src="/next/image/MainPage.png"
              alt="Main Welcome"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
                zIndex: 11001,
                pointerEvents: "none",
                userSelect: "none",
              }}
              priority
            />
          </div>
        )}
      </main>
    </>
  );
}
