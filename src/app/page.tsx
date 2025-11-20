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

          /* NEW — fits large screens while keeping iPhone proportions */
          width: "min(100vw, 430px)",
          height: "min(calc(100vw * 1.4), 100vh, 620px)",

          /* Prevents it from shrinking too much */
          maxWidth: "430px",
          maxHeight: "620px",
        }}
      >
        {/* Menu image */}
        <Image
          src="/next/image/cars2.png"
          alt="Menu principal"
          fill
          priority
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* Migu Player button */}
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

        {/* CV / Portfolio button */}
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