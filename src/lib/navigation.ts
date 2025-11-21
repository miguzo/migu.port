"use client";
import { useRouter } from "next/navigation";

export function useTransitionRouter() {
  const router = useRouter();

  const navigateWithFade = (path: string, delay = 600) => {
    const overlay = document.getElementById("transition-overlay");
    if (overlay) {
      overlay.style.pointerEvents = "auto";
      overlay.style.opacity = "1";
    }

    setTimeout(() => {
      router.push(path);
    }, delay);
  };

  return navigateWithFade;
}
