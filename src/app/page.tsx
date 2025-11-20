"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeMenu() {
  const router = useRouter();

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
      }}
    >
      <div
        style={{
          position: "relative",

          // ALLOWS BIGGER SIZE ON DESKTOP
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",

          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* IMAGE */}
        <Image
          src="/next/image/cars2.png"
          alt="Menu principal"
          fill
          priority
          sizes="100vw"  // <-- ALLOWS UPSCALING
          style={{
            objectFit: "contain", // keeps proportions
            objectPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* MIGU PLAYER BUTTON */}
        <button
          onClick={() => router.push("/player")}
          style={{
            position: "absolute",
            left: "14%",
            top: "30%",
            width: "20%",
            height: "40%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Migu Player"
        />

        {/* CV / PORTFOLIO BUTTON */}
        <button
          onClick={() => router.push("/cv")}
          style={{
            position: "absolute",
            left: "50%",
            top: "30%",
            width: "20%",
            height: "40%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Portfolio / Who Am I"
        />
      </div>
    </main>
  );
}
