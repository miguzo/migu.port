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
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(95vw, 430px)",                // ⬅ same as your menu
          height: "min(85vh, calc(95vw * 1.4), 620px)", // ⬅ same as your menu
        }}
      >
        {/* CV background image (same style as menu) */}
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

        {/* Home icon PNG (visual only) */}
        <Image
          src="/next/image/home.png"
          alt="Back to main"
          width={90}              // adjust if you want larger
          height={90}
          style={{
            position: "absolute",
            top: "4%",
            left: "44%",
            zIndex: 10,
            pointerEvents: "none", // let clicks go to the link
          }}
        />

        {/* Clickable hotspot that sends to igordubreucq.com */}
        <a
          href="https://igordubreucq.com"
          style={{
            position: "absolute",
            top: "4%",
            left: "44%",
            width: "20%",          // roughly match the icon size
            height: "12%",
            zIndex: 20,
            background: "transparent",
            cursor: "pointer",
            display: "block",
          }}
          aria-label="Back to main menu"
        />
      </div>
    </main>
  );
}
