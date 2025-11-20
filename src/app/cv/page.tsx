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
      <BackButton />

      <div
        style={{
          position: "relative",
          width: "min(95vw, 430px)",
          height: "min(90vh, calc(95vw * 1.4), 620px)",
        }}
      >
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
