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
  style={{ minHeight: "100vh", minWidth: "100vw" }}
>
  <div className="relative w-full max-w-[430px] h-[570px] sm:w-[410px] md:w-[430px] md:h-[620px]">
    <Image
      src="/next/image/NewCardFrame.png"
      alt="Main Visual"
      fill
      style={{
        objectFit: "cover", // Use "cover" if you want it to fill the card area!
        objectPosition: "center",
        background: "transparent",
      }}
      priority
      sizes="(max-width: 600px) 80vw, 430px"
    />
    {/* If you want to overlay content, you can add it here */}
  </div>
</main>
    </>
  );
}
