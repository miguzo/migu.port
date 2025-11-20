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
          width: "min(95vw, 430px)",
          height: "min(85vh, calc(95vw * 1.4), 620px)",
        }}
      >
        {/* Ton image de menu */}
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

        {/* Bouton Migu Player */}
        <button
          onClick={() => router.push("/player")}
          style={{
            position: "absolute",
            left: "14%",    // à ajuster
            top: "30%",     // à ajuster
            width: "20%",   // à ajuster
            height: "40%",  // à ajuster
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Migu Player"
        />

        {/* Bouton CV / Portfolio */}
        <button
          onClick={() => router.push("/cv")}
          style={{
            position: "absolute",
            left: "50%",    // à ajuster selon ton image
            top: "30%",     // à ajuster
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
