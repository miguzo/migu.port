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
          className="
            relative
            w-full
            max-w-[430px]
            h-[78vw]      // makes it large on mobile (78% of viewport width = 292px on 375px screen)
            max-h-[620px] // caps height on larger screens
            sm:h-[540px]
            md:h-[620px]
            flex
            items-center
            justify-center
          "
          style={{
            background: "transparent",
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
              pointerEvents: "none",
              userSelect: "none",
            }}
            priority
            sizes="(max-width: 600px) 90vw, 430px"
          />
        </div>
      </main>
    </>
  );
}
