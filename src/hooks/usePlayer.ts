"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { projects } from "@/data/projects";

/**
 * Owns the <audio> element outright.
 *
 * Previously `src` was set two ways at once — as a React prop AND imperatively
 * in three handlers — so the track-ended path needed a 30ms setTimeout to race
 * React's commit. Here nothing else assigns `src`: callers move `trackIdx` and
 * a single effect reacts to it. The <audio> tag must therefore be rendered
 * WITHOUT a src prop.
 *
 * `isPlaying` is derived from real media events rather than from which button
 * was last clicked, so it stays correct when a track auto-advances, when
 * playback is rejected, or when the browser pauses us.
 */
export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [projectIdx, setProjectIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  /** Nothing has been played yet, so neither Play nor Pause should light up. */
  const [hasStarted, setHasStarted] = useState(false);

  /** Whether the pending src change should begin playing once applied. */
  const autoPlayRef = useRef(false);

  const project = projects[projectIdx];
  const track = project.playlist[trackIdx];

  const attemptPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;
    // play() on an element with no buffered data starts the fetch itself, so
    // there is no need to wait for canplaythrough. With preload="none" that
    // wait was the normal path, and a later buffer stall could re-fire it.
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  // --- The one and only place audio.src is assigned ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    if (autoPlayRef.current) {
      autoPlayRef.current = false;
      attemptPlay();
    }
  }, [track.src, attemptPlay]);

  // --- Playback state follows the element, not the buttons ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => { setIsPlaying(true); setHasStarted(true); };
    const onPause = () => setIsPlaying(false);
    const onError = () => setIsPlaying(false);
    const onEnded = () => {
      // Same path as the Next Track button: advance and keep playing.
      autoPlayRef.current = true;
      setTrackIdx(i => (i + 1) % projects[projectIdx].playlist.length);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
    };
  }, [projectIdx]);

  const play = useCallback(() => attemptPlay(), [attemptPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  /** Advance one track and start playing it. */
  const nextTrack = useCallback(() => {
    const len = projects[projectIdx].playlist.length;
    // A one-track playlist leaves trackIdx unchanged, so the src effect would
    // never re-run and the autoplay would be silently dropped. Restart here.
    if (len <= 1) {
      attemptPlay();
      return;
    }
    autoPlayRef.current = true;
    setTrackIdx(i => (i + 1) % len);
  }, [projectIdx, attemptPlay]);

  /** Jump to a project's first track. Does not begin playing. */
  const goToProject = useCallback((idx: number) => {
    autoPlayRef.current = false;
    audioRef.current?.pause();
    setProjectIdx(idx);
    setTrackIdx(0);
  }, []);

  const nextProjectIdx = (projectIdx + 1) % projects.length;

  return {
    audioRef,
    projectIdx, trackIdx, project, track,
    isPlaying, hasStarted,
    play, pause, toggle, nextTrack, goToProject, nextProjectIdx,
  };
}
