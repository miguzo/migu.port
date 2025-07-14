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
        className="fixed inset-0 flex items-center justify-center bg-[#19191b]"
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
  style={{
    position: "relative",
    width: "min(98vw, 430px)", // Slightly bigger max width on mobile
    height: "min(85vh, calc(98vw * 1.44), 620px)", // 1.44 = 430/298, or use your PNG's ratio
    maxHeight: "620px", // Cap on large screens
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

        </div>
      </main>
    </>
  );
}
