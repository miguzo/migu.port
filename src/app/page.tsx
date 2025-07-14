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
        className="fixed inset-0 flex justify-center bg-[#19191b]" // no items-center!
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
            marginTop: "1vh",  // <-- move frame down a bit from the top (adjust as needed)
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src="/next/image/NewCardFrame.png"
            alt="Main Visual"
            fill
            style={{
              objectFit: "contain",
              objectPosition: "center",
              background: "transparent",
            }}
            priority
            sizes="(max-width: 600px) 98vw, 430px"
          />
        </div>
      </main>
    </>
  );
}
