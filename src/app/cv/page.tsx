import Image from "next/image";

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
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(95vw, 430px)",
          height: "min(85vh, calc(95vw * 1.4), 620px)",
        }}
      >
        {/* CV background image */}
        <Image
          src="/next/image/cars.png"
          alt="CV Page"
          fill
          priority
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        {/* === CENTERED HOME BUTTON (PNG + hotspot) === */}
        <div
          style={{
            position: "absolute",
            top: "4%",
            left: "50%",
            transform: "translateX(-50%)",  // ★ centers perfectly
            zIndex: 20,
          }}
        >
          {/* Visual PNG */}
          <Image
            src="/next/image/home.png"
            alt="Home button"
            width={110}     // adjust size here
            height={110}
            style={{
              pointerEvents: "none", // hotspot handles the click
            }}
          />

          {/* Exact-size clickable hotspot */}
          <a
            href="https://igordubreucq.com"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
              background: "transparent",
            }}
            aria-label="Back to main menu"
          />
        </div>

      </div>
    </main>
  );
}
