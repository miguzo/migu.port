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
          width: "min(98vw, 600px)",                    // upscale
          height: "min(90vh, calc(98vw * 1.44), 900px)", // upscale
        }}
      >

        {/* Back PNG */}
    <Image
  src="/next/image/home.png"
  alt="Back icon"
  style={{
    width: "25%",        // 🎯 same visual scale as menu buttons
    height: "auto",
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 10,
    pointerEvents: "none",
  }}
/>

        {/* Clickable hotzone */}
        <BackButton />

        {/* Upscaled fullscreen image */}
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
