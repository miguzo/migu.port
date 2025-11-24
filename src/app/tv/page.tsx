"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// === TYPES: no-any YouTube Player API ===
declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLIFrameElement | string,
        config: Record<string, unknown>
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
}

export default function VideoPage() {
  const router = useRouter();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const [overlayVisible, setOverlayVisible] = useState(true);
  const [locked, setLocked] = useState(false);

  // == Load YouTube API ==
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };
  }, []);

  const createPlayer = () => {
    if (!iframeRef.current) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      events: {},
    });
  };

  // == Invisible play button triggers sound + fade ==
  const handlePlay = () => {
    if (!playerRef.current) return;

    playerRef.current.playVideo(); // plays WITH sound

    // Start fade-out
    setOverlayVisible(false);

    // Lock interaction after fade
    setTimeout(() => {
      setLocked(true);
    }, 800);
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#19191b",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* --- INVISIBLE NAV BUTTONS --- */}
      <button
        onClick={() => router.push("/")}
        aria-label="Home"
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          width: "10%",
          height: "10%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          zIndex: 50,
        }}
      />

      {/* --- HOME ICON --- */}
      <a
        href="https://igordubreucq.com"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "1%",
          width: "12%",
          aspectRatio: "1 / 1",
          zIndex: 60,
          cursor: "pointer",
        }}
      >
        <Image
          src="/next/image/home2.png"
          alt="Home"
          fill
          style={{ objectFit: "contain", pointerEvents: "none" }}
        />
      </a>

      {/* === YOUR EXACT CONTAINER (unchanged) === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === INVISIBLE CUSTOM PLAY BUTTON (place wherever) === */}
        <button
          onClick={handlePlay}
          style={{
            position: "absolute",
            left: "22%", // you can adjust this
            top: "70%", // you can adjust this
            width: "20%",
            height: "8%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            zIndex: 300,
          }}
        />

        {/* === BLACK FADE OVERLAY (NOW WORKS) === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "black",
            opacity: overlayVisible ? 1 : 0,
            transition: "opacity 0.8s ease",
            zIndex: 150,       // BELOW FRAME
            pointerEvents: "none",
          }}
        />

        {/* === VIDEO === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          <iframe
            ref={iframeRef}
            id="ytplayer"
            src="https://www.youtube.com/embed/rTYdjkZaPh0?enablejsapi=1&controls=0&modestbranding=1&rel=0&showinfo=0"
            style={{
              width: "65%",
              height: "62%",
              border: "none",
              transform: "translateX(3%) rotateY(20deg)",
              pointerEvents: locked ? "none" : "auto",
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

        {/* === TV FRAME (TOP) === */}
        <Image
          src="/next/image/tv_frame.png"
          alt="TV Frame"
          fill
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            zIndex: 200,
          }}
        />
      </div>
    </main>
  );
}
