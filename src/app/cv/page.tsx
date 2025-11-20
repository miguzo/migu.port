import Image from "next/image";
import BackButton from "@/components/BackButton";

export default function CVPage() {
  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#19191b",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(95vw, 430px)",
          height: "min(90vh, calc(95vw * 1.4), 620px)",
        }}
      >

        {/* PNG icon for your back button */}
        <Image
          src="/next/image/home.png"
          alt="Back icon"
          width={80}
          height={80}
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 10,
            pointerEvents: "none", // clickable below
          }}
        />

        {/* Hotzone button */}
        <BackButton />

        {/* Background image */}
        <Image
          src="/next/image/cars.png"
          alt="CV Page"
          fill
          priority
          style={{
            objectFit: "contain",
            objectPosition: "center",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>
    </main>
  );
}
