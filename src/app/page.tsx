import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Head from "next/head";

const playlist = [
  "/music/track1.mp3",
  "/music/track2.mp3",
  "/music/track3.mp3",
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [trackIdx, setTrackIdx] = useState(0);

  // ... rest of your useEffect, image, and layout code ...

  // --- HANDLERS ---
  function handlePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    // Play the current track (or first track)
    audio.src = playlist[trackIdx] || playlist[0];
    audio.play();
  }
  function handlePause() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }
  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
  }
  function handleNext() {
    const nextIdx = (trackIdx + 1) % playlist.length;
    setTrackIdx(nextIdx);
    setTimeout(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = playlist[nextIdx];
      audio.currentTime = 0;
      audio.play();
    }, 0);
  }

  // Play track when trackIdx changes and user hits "Next"
  useEffect(() => {
    // Not auto-play unless user triggered "Next"
  }, [trackIdx]);

  // --- BUTTONS POSITIONS (same as before) ---
  const topButtonPositions = [
    { left: "18.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Play
    { left: "34.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Pause
    { left: "51%", top: "11%", width: "14.7%", height: "4.9%" },   // Restart
    { left: "67.5%", top: "11%", width: "14.7%", height: "4.9%" }, // Next
  ];
  const bottomButton = {
    left: "22.9%",
    top: "78.4%",
    width: "53.3%",
    height: "8.2%",
  };

  return (
    <>
      <Head>
        <title>Victor Clavelly</title>
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
          {/* Background & Frame Images */}
          <Image
            src="/next/image/FragmentsUp.png"
            alt="Fragments Background"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center 25%",
              transform: "scale(0.5)",
              zIndex: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          <Image
            src="/next/image/NewCardFrame.png"
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

          {/* Invisible Top Buttons */}
          <button
            aria-label="Play"
            style={{
              ...topButtonPositions[0],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handlePlay}
          />
          <button
            aria-label="Pause"
            style={{
              ...topButtonPositions[1],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handlePause}
          />
          <button
            aria-label="Restart"
            style={{
              ...topButtonPositions[2],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handleRestart}
          />
          <button
            aria-label="Next"
            style={{
              ...topButtonPositions[3],
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={handleNext}
          />

          {/* Invisible Bottom Button (no action yet) */}
          <button
            aria-label="Bottom Button"
            style={{
              ...bottomButton,
              position: "absolute",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={() => alert("Bottom Button clicked!")}
          />

          {/* Hidden audio player */}
          <audio ref={audioRef} hidden src={playlist[trackIdx]} />
        </div>
      </main>
    </>
  );
}
