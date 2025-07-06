import { useEffect, useRef, useState } from "react"

type Track = {
  src: string
  title: string
  description?: string
}

export function useAudioPlayer(tracks: Track[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Play next track when one ends
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      const nextIndex = currentIndex + 1
      if (nextIndex < tracks.length) {
        setCurrentIndex(nextIndex)
      }
    }

    audio.addEventListener("ended", handleEnded)
    return () => audio.removeEventListener("ended", handleEnded)
  }, [currentIndex, tracks.length])

  // Change track and auto-play
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.src = tracks[currentIndex]?.src || ""
      audio.play().catch(() => {
        // Autoplay might be blocked
      })
    }
  }, [currentIndex, tracks])

  // Reset index when playlist changes
  useEffect(() => {
    setCurrentIndex(0)
  }, [tracks])

  return {
    audioRef,
    currentTrack: tracks[currentIndex],
    currentIndex,
  }
}
