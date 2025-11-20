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
          width: "min(90vw, 800px)",
          height: "calc(min(90vw, 800px) * 1.35)",
          maxHeight: "90vh",
        }}
      >

        {/* Home icon */}
        <Image
          src="/next/image/home.png"
          alt="Back icon"
          style={{
            width: "100%",       // scales with new container size
            height: "auto",
            position: "absolute",
            top: "2%",
            left: "140%",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

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
