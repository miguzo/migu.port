"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Howl } from "howler";

import { TOP_BUTTON_POSITIONS, BTN } from "@/data/projects";
import { FRAME_SIZES, Z, CRITICAL_IMAGES, DEFERRED_IMAGES } from "@/lib/player-config";
import { HiddenPreload } from "@/components/player/HiddenPreload";
import { ButtonHotzone } from "@/components/player/ButtonHotzone";
import { ImageOverlay } from "@/components/player/ImageOverlay";
import { Splash } from "@/components/player/Splash";
import { usePlayer } from "@/hooks/usePlayer";
import { useHubShortcut } from "@/hooks/useHubShortcut";

export default function Home() {
  const router = useRouter();
  const player = usePlayer();
  const { project, track, isPlaying, hasStarted } = player;

  // --- Overlays ---
  const [pageOpen, setPageOpen] = useState(true);
  const [aboutMeOpen, setAboutMeOpen] = useState(false);
  const [mainPageVisible, setMainPageVisible] = useState(false);

  // --- Splash / loading ---
  const [loadedCount, setLoadedCount] = useState(0);
  const [splashDone, setSplashDone] = useState(false);
  const [splashFading, setSplashFading] = useState(false);

  // --- Project switch fade ---
  const [blackFade, setBlackFade] = useState(false);
  const [blackOpacity, setBlackOpacity] = useState(0);

  /** Transient press feedback for buttons that are not play/pause. */
  const [pressedIdx, setPressedIdx] = useState<null | number>(null);

  // --- SFX ---
  const buttonSound = useRef<Howl | null>(null);
  const pageOnSound = useRef<Howl | null>(null);
  const pageOffSound = useRef<Howl | null>(null);

  // --- Timers, cleared on unmount so no callback fires into a dead tree ---
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const pending = timers.current;
    return () => { pending.forEach(clearTimeout); };
  }, []);

  // --- Loading progress, driven by the real <Image> loads ---
  const settledRef = useRef<Set<string>>(new Set());
  const handleCriticalSettled = useCallback((src: string) => {
    if (settledRef.current.has(src)) return;
    settledRef.current.add(src);
    setLoadedCount(settledRef.current.size);
  }, []);
  const loading = loadedCount < CRITICAL_IMAGES.length;
  const loadingProgress = loadedCount / CRITICAL_IMAGES.length;

  // --- SFX (music tracks are never preloaded) ---
  useEffect(() => {
    buttonSound.current = new Howl({ src: ["/sounds/Button.mp3"], html5: true });
    pageOnSound.current = new Howl({ src: ["/sounds/PageON.mp3"], html5: true });
    pageOffSound.current = new Howl({ src: ["/sounds/PageOFF.mp3"], html5: true });
    return () => {
      buttonSound.current?.unload();
      pageOnSound.current?.unload();
      pageOffSound.current?.unload();
    };
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

  // --- Always show the page overlay when switching projects ---
  useEffect(() => { setPageOpen(true); }, [player.projectIdx]);

  const handleSplashEnter = useCallback(() => {
    if (loading) return;
    setSplashFading(true);
    later(() => {
      setSplashDone(true);
      setSplashFading(false);
      pageOnSound.current?.play();
      setMainPageVisible(true);
    }, 500);
  }, [loading, later]);

  const overlayOpen = pageOpen || aboutMeOpen || mainPageVisible;

  const closePage = useCallback(() => {
    pageOffSound.current?.play();
    setPageOpen(false);
  }, []);
  const closeAboutMe = useCallback(() => {
    pageOffSound.current?.play();
    setAboutMeOpen(false);
  }, []);
  const closeMainPage = useCallback(() => {
    pageOffSound.current?.play();
    setMainPageVisible(false);
  }, []);

  const { goToProject, nextProjectIdx } = player;
  const handleNextProject = useCallback(() => {
    if (blackFade) return;
    buttonSound.current?.play();
    setPressedIdx(BTN.NEXT_PROJECT);
    setBlackFade(true);
    setBlackOpacity(1);

    later(() => {
      goToProject(nextProjectIdx);
      later(() => {
        setBlackOpacity(0);
        setPressedIdx(null);
        later(() => setBlackFade(false), 700);
      }, 700);
    }, 500);
  }, [blackFade, goToProject, nextProjectIdx, later]);

  const handleNextTrack = useCallback(() => {
    buttonSound.current?.play();
    setPressedIdx(BTN.NEXT_TRACK);
    // Autoplays the new track; the Play button lights up on its own because it
    // now follows isPlaying rather than the last button clicked.
    player.nextTrack();
    later(() => setPressedIdx(null), 300);
  }, [player, later]);

  /** One dispatch instead of an array of inline useCallbacks. */
  const handleButton = useCallback((idx: number) => {
    if (overlayOpen && idx !== BTN.ABOUT) return;
    switch (idx) {
      case BTN.PLAY:
        buttonSound.current?.play();
        player.play();
        break;
      case BTN.PAUSE:
        buttonSound.current?.play();
        player.pause();
        break;
      case BTN.NEXT_TRACK:
        handleNextTrack();
        break;
      case BTN.NEXT_PROJECT:
        handleNextProject();
        break;
      case BTN.PAGE:
        pageOnSound.current?.play();
        setPageOpen(true);
        break;
      case BTN.ABOUT:
        if (aboutMeOpen) return;
        pageOnSound.current?.play();
        setAboutMeOpen(true);
        break;
    }
  }, [overlayOpen, aboutMeOpen, player, handleNextTrack, handleNextProject]);

  /** "i" leaves the player for the hub menu. Pause first so the track does not
   *  keep playing underneath the hub's ambient bed. */
  const openHub = useCallback(() => {
    player.pause();
    router.push("/hub");
  }, [player, router]);

  useHubShortcut({ enabled: splashDone && !blackFade, onOpenHub: openHub });

  /**
   * Which button art shows its ON frame. Play and Pause reflect real playback
   * state; the rest are momentary presses.
   */
  const isLit = (idx: number) => {
    if (idx === BTN.PLAY) return isPlaying;
    if (idx === BTN.PAUSE) return hasStarted && !isPlaying;
    return pressedIdx === idx;
  };

  return (
    <>
      {/* Warms the optimized URLs the render below will request. */}
      <HiddenPreload sources={CRITICAL_IMAGES} onSettled={handleCriticalSettled} />
      {splashDone && <HiddenPreload sources={DEFERRED_IMAGES} />}

      <main
        className="fixed inset-0 flex items-center justify-center bg-[#19191b]"
        style={{ minHeight: "100vh", minWidth: "100vw", position: "relative" }}
      >
        {/* --- Spherical Glow BG --- */}
        <div
          aria-hidden
          style={{
            position: "absolute", left: "46%", top: "30%",
            width: "60vw", height: "60vw", maxWidth: "600px", maxHeight: "600px",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, #d8ccaf55 0%, #19191b 70%, #19191b 100%)",
            filter: "blur(80px)", opacity: 0.7, zIndex: Z.glow,
            pointerEvents: "none", userSelect: "none",
          }}
        />

        {/* --- Fade to black between projects --- */}
        {blackFade && (
          <div
            style={{
              position: "fixed", inset: 0, background: "black",
              opacity: blackOpacity, pointerEvents: "auto",
              transition: "opacity 0.7s cubic-bezier(.7,0,.3,1)",
              zIndex: Z.blackFade,
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
          {(loading || !splashDone) && (
            <Splash
              ready={!loading}
              fading={splashFading}
              progress={loadingProgress}
              onEnter={handleSplashEnter}
            />
          )}

          {/* --- Main frame (background+frame) --- */}
          <Image
            src={project.mainImg}
            alt="Main Visual Frame"
            fill
            sizes={FRAME_SIZES}
            style={{
              objectFit: "contain", objectPosition: "center", background: "transparent",
              zIndex: Z.frame, pointerEvents: "none", userSelect: "none",
            }}
            priority
          />

          {/* --- Title image --- */}
          <Image
            src={track.titleImg}
            alt="Song Title"
            fill
            sizes={FRAME_SIZES}
            style={{
              objectFit: "contain", objectPosition: "center",
              zIndex: Z.title, pointerEvents: "none", userSelect: "none",
            }}
            priority
          />

          {/* --- Button art --- */}
          {project.buttons.map((img, idx) => (
            <Image
              key={idx}
              src={isLit(idx) ? img.on : img.off}
              alt=""
              fill
              sizes={FRAME_SIZES}
              style={{
                objectFit: "contain", objectPosition: "center",
                zIndex: Z.buttons, pointerEvents: "none", userSelect: "none",
              }}
              priority={idx === 0}
            />
          ))}

          {/* --- Button hotzones --- */}
          {TOP_BUTTON_POSITIONS.map((pos, idx) => (
            <ButtonHotzone
              key={idx}
              idx={idx}
              pos={pos}
              onClick={() => handleButton(idx)}
              disabled={
                overlayOpen ||
                pressedIdx === idx ||
                (idx === BTN.NEXT_PROJECT && blackFade)
              }
            />
          ))}

          {/* --- Project page overlay --- */}
          {pageOpen && (
            <ImageOverlay
              src={project.pageImg}
              alt="Project Page"
              zIndex={Z.pageOverlay}
              onClose={closePage}
            >
              {(project.links ?? []).map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: "absolute",
                    left: link.left, top: link.top,
                    width: link.width, height: link.height,
                    zIndex: Z.pageOverlay + 2, cursor: "pointer", display: "block",
                  }}
                  aria-label={link.label}
                />
              ))}
            </ImageOverlay>
          )}

          {/* --- Intro page, shown once after the splash --- */}
          {mainPageVisible && (
            <ImageOverlay
              src="/next/image/MainPage.png"
              alt="Intro Page"
              zIndex={Z.mainPage}
              onClose={closeMainPage}
            />
          )}

          {/* --- About me overlay --- */}
          {aboutMeOpen && (
            <ImageOverlay
              src="/next/image/AboutMe.png"
              alt="About Me"
              zIndex={Z.aboutMe}
              onClose={closeAboutMe}
            >
              <a
                href="mailto:igordubreucq.pro@gmail.com"
                style={{
                  position: "absolute", left: "53%", top: "51%",
                  width: "15%", height: "7%",
                  zIndex: Z.aboutMe + 2, cursor: "pointer", display: "block",
                }}
                aria-label="Email"
              />
              <a
                href="https://instagram.com/migu.exe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: "absolute", left: "43%", top: "44%",
                  width: "24%", height: "7%",
                  zIndex: Z.aboutMe + 2, cursor: "pointer", display: "block",
                }}
                aria-label="Instagram"
              />
            </ImageOverlay>
          )}

          {/* Src and playback are owned entirely by usePlayer — no src prop here. */}
          <audio ref={player.audioRef} hidden preload="none" />
        </div>
      </main>
    </>
  );
}
