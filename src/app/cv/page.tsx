import Image from "next/image";
import BackButton from "@/components/BackButton";

export default function CVPage() {
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

        {/* === BACKGROUND IMAGE (cars.png) === */}
        <Image
          src="/next/image/cars.png"
          alt="CV Page"
          fill
          priority
          style={{
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />

        {/* === HOME BUTTON PNG (FULL SCALE) === */}
        <Image
          src="/next/image/home.png"
          alt="Home button graphic"
          fill
          style={{
            objectFit: "contain",
            pointerEvents: "none", // allows hotzone clicks
            zIndex: 20,
          }}
        />

        {/* === CLICKABLE HOTZONE — YOU POSITION THIS === */}
        <button
          onClick={() => (window.location.href = "https://igordubreucq.com")}
          style={{
            position: "absolute",
            left: "40%",  // place exactly where the icon should be clickable
            top: "10%",
            width: "20%",
            height: "12%",
            background: "transparent",
            border: "none",
            zIndex: 30,
            cursor: "pointer",
          }}
        />
      </div>
    </main>
  );
}
