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
        flexDirection: "column",
        gap: "40px",
      }}
    >
      {/* Titre */}
      <h1 style={{
        color: "#d8ccaf",
        fontSize: "20px",
        letterSpacing: "2px",
        fontWeight: "300",
        marginBottom: "20px",
      }}>
        Welcome
      </h1>

      {/* Bloc d'images du menu */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "40px",
      }}>

        {/* Image bouton : Migu Player */}
        <div
          onClick={() => router.push("/player")}
          style={{ cursor: "pointer" }}
        >
          <Image
            src="/next/image/Menu/MiguPlayerThumbnail.png"
            width={250}
            height={350}
            alt="Migu Player"
            style={{
              objectFit: "contain",
              transition: "0.3s",
            }}
          />
        </div>

        {/* Image bouton : CV */}
        <div
          onClick={() => router.push("/cv")}
          style={{ cursor: "pointer" }}
        >
          <Image
            src="/next/image/Menu/CVThumbnail.png"
            width={250}
            height={350}
            alt="Portfolio / CV"
            style={{
              objectFit: "contain",
              transition: "0.3s",
            }}
          />
        </div>

      </div>
    </main>
  );
}
