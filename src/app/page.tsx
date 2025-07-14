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
              width: "min(96vw, 430px)",
              height: "auto",
              maxHeight: "86vh",    // Key: no taller than 86% of the viewport
              aspectRatio: "430/620", // Replace with your real image aspect!
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
              sizes="(max-width: 600px) 95vw, 430px"
            />
          </div>
        </div>
      </main>
    </>
  );
}
