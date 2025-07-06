"use client"

import { useEffect } from "react"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"

type Track = {
  src: string
  title: string
  description?: string
}

export function AudioPlayerEngine({ tracks }: { tracks: Track[] }) {
  const { audioRef } = useAudioPlayer(tracks)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.play().catch(() => {
        // Might be blocked on first load
      })
    }
  }, [audioRef])

  return (
    <audio
      ref={audioRef}
      className="hidden"
      controls={false}
      preload="auto"
    />
  )
}
