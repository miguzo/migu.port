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
            width: "min(84vw,430px)",
            height: "min(80vw,500px)",
            borderRadius: 24,
            boxShadow: "0 8px 42px 0 #e5c06c44",
            background: "rgba(229,192,108,0.06)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Image
            src="/next/image/NewCardFrame.png"
            alt="Main Visual"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center",
              borderRadius: 24,
            }}
            priority
            sizes="(max-width: 600px) 80vw, 430px"
          />
        </div>
      </main>
    </>
  );
}
