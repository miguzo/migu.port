"use client";
import { useEffect } from "react";
import Image from "next/image";
import Head from "next/head";

export default function Home() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  // Button hitbox positions (in % for 375x667 aspect, as measured above)
  const topButtonPositions = [
    { left: "6.4%", top: "6.9%", width: "14.7%", height: "4.9%" },   // 1st
    { left: "24.3%", top: "6.9%", width: "14.7%", height: "4.9%" },  // 2nd
    { left: "42.4%", top: "6.9%", width: "14.7%", height: "4.9%" },  // 3rd
    { left: "60.3%", top: "6.9%", width: "14.7%", height: "4.9%" },  // 4th
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
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "min(98vw, 430px)",
            height: "min(85vh, calc(98vw * 1.44), 620px)", // adjust 1.44 to your PNG aspect ratio
            maxHeight: "620px",
            marginTop: "1vh", // spacing from the top
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* --- Background image behind the frame --- */}
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

          {/* --- Frame PNG on top --- */}
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

          {/* --- Invisible Top Buttons --- */}
          {topButtonPositions.map((btn, i) => (
            <button
              key={i}
              aria-label={`Top Button ${i + 1}`}
              style={{
                position: "absolute",
                left: btn.left,
                top: btn.top,
                width: btn.width,
                height: btn.height,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                zIndex: 10,
                // Uncomment this next line to debug (shows a red overlay)
                // background: "rgba(255,0,0,0.18)"
              }}
              onClick={() => alert(`Top Button ${i + 1} clicked!`)}
            />
          ))}

          {/* --- Invisible Bottom Button --- */}
          <button
            aria-label="Bottom Button"
            style={{
              position: "absolute",
              left: bottomButton.left,
              top: bottomButton.top,
              width: bottomButton.width,
              height: bottomButton.height,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              zIndex: 10,
              // Uncomment this next line to debug (shows a red overlay)
              // background: "rgba(255,0,0,0.18)"
            }}
            onClick={() => alert("Bottom Button clicked!")}
          />
        </div>
      </main>
    </>
  );
}
