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
              objectFit: "contain",    // frame never cropped
              objectPosition: "center",
              background: "transparent",
              zIndex: 2,
              pointerEvents: "none",
              userSelect: "none",
            }}
            priority
            sizes="(max-width: 600px) 98vw, 430px"
          />
        </div>
      </main>
    </>
  );
}
