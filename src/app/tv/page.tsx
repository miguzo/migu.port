"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { BackToMenu } from "@/components/BackToMenu";
import { HUB_SIZES } from "@/lib/player-config";

/** Never hold the page black longer than this, even if the frame never loads. */
const REVEAL_TIMEOUT_MS = 3000;

/**
 * The snow lasts as long as the video takes to start, between these two
 * bounds. The embed is mounted *underneath* the snow, so the loading happens
 * during the noise rather than after it.
 *
 * The floor is high on purpose: YouTube flashes its own play/pause glyph in
 * the first moments of playback, and the snow has to outlast it.
 */
const MIN_STATIC_MS = 5000;
const MAX_STATIC_MS = 10000;

/**
 * How long YouTube's start-up glyph takes to fade once playback begins. The
 * snow is held for at least this long *after* the player reports PLAYING,
 * measured rather than assumed: the icon outlives the first frame by about a
 * second, so ending the snow the instant the picture arrives shows it.
 */
const GLYPH_HOLD_MS = 3600;

/**
 * The length of the handover at the end of the snow: the noise ducking away
 * and the channel opening up under it, both at once, with the snow held over
 * the top for the whole of it.
 */
const HANDOVER_MS = 900;

/** The snow does not cut, it dissolves. */
const SNOW_FADE_MS = 500;

/**
 * The embed is muted for its whole life and the sound comes from a file we
 * serve ourselves, decoded into the same AudioContext the noise runs through.
 *
 * That single decision is what makes the rest of this page simple. A muted
 * embed is the one thing every browser will autoplay, so the picture is never
 * in doubt; and the track, being ours, is an ordinary node in our own graph —
 * so it can be filtered, ducked and crossfaded like anything else, instead of
 * being shouted at through postMessage and hoping.
 *
 * The context is opened by the press of the play ball, and a context opened by
 * a gesture stays open. Nothing afterwards needs permission again — which is
 * the whole reason the snow can be heard on a phone at all.
 */
const MUSIC_GAIN = 0.9;
/** Under the snow the track is not just quiet, it is behind the glass. */
const MUSIC_SNOW_GAIN = 0.1;
const MUSIC_SNOW_HZ = 620;
const MUSIC_OPEN_HZ = 20000;

const NOISE_GAIN = 0.22;

/**
 * Desktop starts the muted embed on its own and the nudge below never fires.
 * Phones are less reliable — and worse, `onLoad` fires well before the player
 * inside is listening, so a single shot at it is often shouted into a closed
 * door. So the nudge is a short series instead, abandoned the moment the
 * player reports PLAYING.
 */
const NUDGE_TRIES = 8;
const NUDGE_EVERY_MS = 600;

/**
 * Two clocks running side by side drift for one reason worth correcting: the
 * video stalls to buffer and the track plays on through it. Past this much
 * daylight the track is restarted at the picture's own time.
 */
const SYNC_TOLERANCE_S = 0.35;

type Channel = {
  id: string;
  label: string;
  /**
   * The track as it is cut for the video, which is not always the track as it
   * appears on the record. Null until the file exists: a channel with no audio
   * plays its picture in silence rather than breaking.
   */
  audio: string | null;
};

/**
 * The dial cycles through these in order and wraps. There is deliberately no
 * channel number on screen: the only way to know what is on is to turn the
 * knob and watch.
 *
 * `id` is the YouTube video id — the part after `v=` in a watch URL.
 */
const CHANNELS: Channel[] = [
  { id: "rTYdjkZaPh0", label: "Channel 1", audio: "/music/TV/Melody_TV.mp3" },
  { id: "9vqVzGTkRU4", label: "Channel 2", audio: "/music/TV/Velith_TV.mp3" },
];

/**
 * The two balls painted at the bottom corners of `tv_frame.png`: play on the
 * left, next on the right. Restored from commit 3629004, which is the only
 * version of the frame that has them.
 *
 * Percentages are of the container, not of the image. The container is
 * portrait (900×1260) while the frame art is landscape, so `object-fit:
 * contain` letterboxes it into the middle ~54% of the height — which is why
 * the vertical numbers look large for something sitting near the bottom of
 * the picture.
 */
const PLAY_BALL = { left: "3%", top: "69.5%", width: "12%", height: "8%" };
const NEXT_BALL = { left: "81.5%", top: "69.5%", width: "13.5%", height: "8%" };

/** Shared by both balls; only the rectangle differs. */
const BALL_STYLE: CSSProperties = {
  position: "absolute",
  zIndex: 300,
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

/** Geometry of the picture inside the frame. The static must match it exactly. */
const SCREEN: CSSProperties = {
  width: "80%",
  height: "54%",
  transform: "translateX(3%) rotateY(20deg)",
};

/** Wraps a child in the same centred, clipped box the picture sits in. */
const layer = (zIndex: number, clickable = false): CSSProperties => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  zIndex,
  ...(clickable ? null : { pointerEvents: "none" as const }),
});

export default function VideoPage() {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const [channel, setChannel] = useState(0);
  const current = CHANNELS[channel];

  /** True while the screen is showing snow. */
  const [tuning, setTuning] = useState(false);
  /** True for the moment the snow spends dissolving into the picture. */
  const [fading, setFading] = useState(false);
  /**
   * The set is off until the play ball is pressed. That press is what opens
   * the AudioContext — everything this page makes a sound with descends from
   * it — and it also means the visitor never sees YouTube's red play button.
   */
  const [on, setOn] = useState(false);

  /**
   * The player refuses postMessage commands unless the embed URL names the
   * page they will come from. Read on the client, since there is no window to
   * ask on the server — and only ever used for an iframe that mounts after a
   * click, so it is always filled in by the time it matters.
   */
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const staticCanvas = useRef<HTMLCanvasElement | null>(null);
  const embed = useRef<HTMLIFrameElement | null>(null);

  const audioCtx = useRef<AudioContext | null>(null);
  const noise = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);

  /**
   * The track streams from an ordinary audio element rather than a decoded
   * buffer. A twelve-minute master decodes to something like a quarter of a
   * gigabyte of raw samples, which a phone will not survive — and the element
   * brings two things the buffer could not: it plays before it has finished
   * downloading, and it can be seeked, which is what keeps it with the picture.
   *
   * The element is only a source. Everything audible about it happens in the
   * graph below, so the snow's filter and the handover work exactly as before.
   */
  const musicEl = useRef<HTMLAudioElement | null>(null);
  const musicChain = useRef<{ gain: GainNode; filter: BiquadFilterNode } | null>(null);
  /** True from the moment the picture starts until the set is retuned. */
  const musicWanted = useRef(false);
  /** True once the handover has run, so a late track starts already open. */
  const handedOver = useRef(false);
  /** Where the picture says it is, straight from the player. */
  const videoTime = useRef(0);

  const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nudges = useRef(0);
  /** Runs from PLAYING to the moment the start-up glyph has faded. */
  const glyphTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Runs from the start of the handover to the moment the snow may lift. */
  const leadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * The player is doing something of its own — buffering or playing. Nudging
   * one that is already under way is what makes it flash its glyph, so this is
   * a wider stop signal than PLAYING alone.
   */
  const awake = useRef(false);
  /** The floor has passed, so the snow may end as soon as the picture is up. */
  const minElapsed = useRef(false);
  /** The player has reported PLAYING for the channel now being tuned. */
  const playingSeen = useRef(false);
  /** PLAYING, plus long enough for the start-up glyph to have gone. */
  const pictureUp = useRef(false);
  /** False when switching the set off — there is no picture to wait for. */
  const awaitingPicture = useRef(false);

  // Continues the hub's fade-to-black: arrive black, then reveal once the TV
  // frame is up, instead of showing a half-built page. The embed is not part
  // of the gate — it does not exist until the set is switched on.
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), REVEAL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const ready = frameLoaded || timedOut;

  /** One command to the player. A no-op when the set is off: there is no embed. */
  const post = useCallback((func: string, args: unknown[] = []) => {
    embed.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    );
  }, []);

  /** Opens the event channel the state listener depends on. */
  const listen = useCallback(() => {
    embed.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
      "*"
    );
  }, []);

  // ---------- THE AUDIO CONTEXT ----------

  // Built at mount rather than on the first press, so the track can be fetched
  // and decoded while the visitor is still looking at a dark screen. It starts
  // suspended — that is all a context may do before it has been asked for —
  // and the play ball resumes it.
  useEffect(() => {
    type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WithWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    audioCtx.current = ctx;
    return () => {
      audioCtx.current = null;
      ctx.close().catch(() => {});
    };
  }, []);

  // ---------- THE CHANNEL'S OWN SOUND ----------

  // The element is wired into the graph exactly once. `createMediaElementSource`
  // may only be called once per element, and after it has been the element no
  // longer reaches the speakers by itself — everything it makes now arrives
  // through this chain, which is precisely what we want.
  useEffect(() => {
    const ctx = audioCtx.current;
    const el = musicEl.current;
    if (!ctx || !el || musicChain.current) return;

    const source = ctx.createMediaElementSource(el);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = MUSIC_SNOW_HZ;
    const gain = ctx.createGain();
    gain.gain.value = MUSIC_SNOW_GAIN;

    source.connect(filter).connect(gain).connect(ctx.destination);
    musicChain.current = { gain, filter };
  }, []);

  // React writes the new src onto the element, but an <audio> already holding a
  // track ignores it until it is told to load again.
  useEffect(() => {
    const el = musicEl.current;
    if (!el) return;
    el.load();
  }, [current.audio]);

  /** Silences the track without tearing the graph down. */
  const stopMusic = useCallback(() => {
    const el = musicEl.current;
    if (!el) return;
    el.pause();
  }, []);

  /**
   * Puts the track at `offset` — wherever the picture has got to — and lets it
   * run. Under the snow it comes up quiet and steeply filtered: present, but
   * heard through the noise rather than beside it.
   */
  const startMusic = useCallback((offset: number) => {
    const el = musicEl.current;
    const chain = musicChain.current;
    const ctx = audioCtx.current;
    if (!el || !chain || !ctx || !el.currentSrc) return;

    const t = ctx.currentTime;
    const open = handedOver.current;
    chain.filter.frequency.cancelScheduledValues(t);
    chain.filter.frequency.setValueAtTime(open ? MUSIC_OPEN_HZ : MUSIC_SNOW_HZ, t);
    chain.gain.gain.cancelScheduledValues(t);
    chain.gain.gain.setValueAtTime(open ? MUSIC_GAIN : MUSIC_SNOW_GAIN, t);

    // Past the end of the track the picture simply runs on in silence, which
    // is a good deal less strange than the track starting over.
    const at = Math.max(0, offset);
    if (el.duration && at >= el.duration) return;
    // Seeking an element that has not buffered that far yet is allowed — it
    // simply waits — which is the other half of why this streams.
    if (Math.abs(el.currentTime - at) > SYNC_TOLERANCE_S) el.currentTime = at;
    void el.play().catch(() => {});
  }, []);

  /**
   * Called from inside the press of the play ball, and only for that. A phone
   * will not let an element play unless a gesture asked it to, but it counts
   * the element as asked-for ever after — so this spends the gesture at the
   * moment it exists, on a track that is immediately stopped again. What it
   * buys is the right to start it later, when the picture is ready.
   */
  const unlockMusic = useCallback(() => {
    const el = musicEl.current;
    if (!el) return;
    void el
      .play()
      .then(() => el.pause())
      .catch(() => {});
  }, []);

  /** The handover: the filter opens and the level comes up to meet the picture. */
  const openMusic = useCallback(() => {
    handedOver.current = true;
    const ctx = audioCtx.current;
    const chain = musicChain.current;
    if (!ctx || !chain) return;

    const t = ctx.currentTime;
    const d = HANDOVER_MS / 1000;

    chain.gain.gain.cancelScheduledValues(t);
    chain.gain.gain.setValueAtTime(chain.gain.gain.value, t);
    chain.gain.gain.linearRampToValueAtTime(MUSIC_GAIN, t + d);

    // Exponential, because a filter sweep is heard by octave: a linear one
    // spends nearly all its travel in the top of the range, where there is
    // little left to uncover.
    chain.filter.frequency.cancelScheduledValues(t);
    chain.filter.frequency.setValueAtTime(chain.filter.frequency.value, t);
    chain.filter.frequency.exponentialRampToValueAtTime(MUSIC_OPEN_HZ, t + d);
  }, []);

  // ---------- SNOW, THE SOUND ----------

  /** A bed of filtered white noise, held for as long as the snow is up. */
  const startNoise = useCallback(() => {
    const ctx = audioCtx.current;
    if (!ctx) return;
    // The gesture that got us here is what makes this legal. Everything else
    // this page plays rides on the context staying open afterwards.
    if (ctx.state === "suspended") void ctx.resume();

    // One second of noise, looped — cheaper than generating the whole bed, and
    // indistinguishable once it is this dense.
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // Rolls the harshest top off, so it reads as a speaker rather than a hiss.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 5200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(NOISE_GAIN, ctx.currentTime + 0.05);

    src.connect(lp).connect(gain).connect(ctx.destination);
    src.start();
    noise.current = { src, gain };
  }, []);

  /**
   * Takes the bed down over `seconds` and stops it. Long for a handover to a
   * channel that is already playing underneath, short for switching the set
   * off, where there is nothing to hand over to.
   */
  const stopNoise = useCallback((seconds = 0.12) => {
    const ctx = audioCtx.current;
    const n = noise.current;
    if (!ctx || !n) return;
    noise.current = null;

    const t = ctx.currentTime;
    n.gain.gain.cancelScheduledValues(t);
    n.gain.gain.setValueAtTime(n.gain.gain.value, t);
    n.gain.gain.linearRampToValueAtTime(0, t + seconds);
    n.src.stop(t + seconds + 0.03);
  }, []);

  // ---------- SNOW, THE SEQUENCE ----------

  /** The snow actually lifting. The noise is already gone by now. */
  const liftSnow = useCallback(() => {
    setTuning(false);
    setFading(true);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setFading(false), SNOW_FADE_MS);
  }, []);

  /**
   * Begins the end of the snow. Both sides of the handover start together —
   * the bed ducking away, the channel opening out from under it — and the snow
   * is held for the length of it, so the join happens behind the picture
   * rather than in front of it.
   */
  const endTuning = useCallback(() => {
    if (minTimer.current) clearTimeout(minTimer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    if (leadTimer.current) clearTimeout(leadTimer.current);

    stopNoise(HANDOVER_MS / 1000);
    openMusic();

    leadTimer.current = setTimeout(liftSnow, HANDOVER_MS);
  }, [liftSnow, stopNoise, openMusic]);

  /** Ends the snow once both the floor has passed and the picture is up. */
  const maybeEnd = useCallback(() => {
    if (!minElapsed.current) return;
    if (awaitingPicture.current && !pictureUp.current) return;
    endTuning();
  }, [endTuning]);

  const beginTuning = useCallback(
    (waitForPicture: boolean) => {
      minElapsed.current = false;
      playingSeen.current = false;
      pictureUp.current = false;
      awake.current = false;
      awaitingPicture.current = waitForPicture;
      musicWanted.current = false;
      handedOver.current = false;
      videoTime.current = 0;
      stopMusic();
      // Spends the press that got us here on the track as well as on the
      // context. Both need a gesture, and this is the only one there will be.
      unlockMusic();
      if (glyphTimer.current) clearTimeout(glyphTimer.current);
      glyphTimer.current = null;
      if (leadTimer.current) clearTimeout(leadTimer.current);
      leadTimer.current = null;

      setTuning(true);
      startNoise();

      if (minTimer.current) clearTimeout(minTimer.current);
      if (maxTimer.current) clearTimeout(maxTimer.current);
      minTimer.current = setTimeout(() => {
        minElapsed.current = true;
        maybeEnd();
      }, MIN_STATIC_MS);
      maxTimer.current = setTimeout(() => {
        // The ceiling exists for a video that never starts. One that started
        // late is a different case, and obeying the ceiling there cuts the snow
        // in the middle of the glyph — precisely the flash the snow is for. So
        // if the picture is on its way, stand down and let the glyph timer say
        // when. It will: the floor is long past by now.
        if (playingSeen.current && !pictureUp.current) return;
        endTuning();
      }, MAX_STATIC_MS);
    },
    [startNoise, maybeEnd, endTuning, stopMusic, unlockMusic]
  );

  /**
   * The play ball. Warms the set up on whatever channel it was left on, and
   * kills it again on a second press — unmounting the embed is also the only
   * reliable way to stop its picture.
   */
  const togglePower = useCallback(() => {
    if (tuning) return;
    if (on) {
      setOn(false);
      beginTuning(false);
    } else {
      setOn(true);
      beginTuning(true);
    }
  }, [tuning, on, beginTuning]);

  /** Turn the dial: snow, and when it clears the next channel is simply there. */
  const turnDial = useCallback(() => {
    if (tuning) return;
    setChannel(c => (c + 1) % CHANNELS.length);
    setOn(true);
    beginTuning(true);
  }, [tuning, beginTuning]);

  // ---------- TALKING TO THE EMBED ----------

  // With `enablejsapi=1` the player answers a "listening" handshake with state
  // updates. That is how the snow knows the picture is actually up, rather
  // than guessing with a fixed delay — and now also how the track knows where
  // the picture has got to.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data !== "string") return;
      if (!e.origin.includes("youtube.com")) return;
      try {
        const msg = JSON.parse(e.data);
        const state = msg?.info?.playerState;

        if (typeof msg?.info?.currentTime === "number") {
          videoTime.current = msg.info.currentTime;
        }

        // 3 is BUFFERING: not a picture yet, but the player is on its way and
        // must not be prodded again. It is also the picture stalling mid-play,
        // which the track would otherwise sail straight past — so it stops and
        // waits to be restarted at wherever the picture resumes.
        if (state === 1 || state === 3) awake.current = true;
        if (state === 3 && musicWanted.current) stopMusic();

        // 1 is PLAYING in the IFrame API's state enum.
        if (state === 1) {
          musicWanted.current = true;
          if (musicEl.current?.paused) startMusic(videoTime.current);

          if (!glyphTimer.current) {
            playingSeen.current = true;
            glyphTimer.current = setTimeout(() => {
              pictureUp.current = true;
              maybeEnd();
            }, GLYPH_HOLD_MS);
          }
        }

        // 2 is PAUSED, which with no controls and the glass on top can only be
        // the player pausing itself. Whatever the reason, the track does not
        // play on over a still picture.
        if (state === 2) stopMusic();
      } catch {
        // The player also sends things that are not JSON. Nothing to do.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [maybeEnd, startMusic, stopMusic]);

  // Two clocks, one of which we cannot drive. They are started together and
  // both run at 1×, so they only part company when the picture stalls — and
  // then only until this notices.
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => {
      const el = musicEl.current;
      if (!el || !musicWanted.current || el.paused) return;
      if (el.duration && videoTime.current >= el.duration) return;
      if (Math.abs(videoTime.current - el.currentTime) > SYNC_TOLERANCE_S) {
        el.currentTime = videoTime.current;
      }
    }, 2000);
    return () => clearInterval(t);
  }, [on]);

  const onEmbedLoad = useCallback(() => {
    // A fresh frame has reported nothing yet. Whatever the last one said about
    // itself does not describe this one.
    awake.current = false;
    playingSeen.current = false;

    listen();

    // The muted autoplay is honoured almost everywhere, but nudge anything that
    // still has not started. Only a player that has not reported for itself:
    // calling playVideo on one that is already running makes it flash its own
    // play glyph, which is exactly what the snow is there to hide.
    //
    // The handshake goes out again with every nudge, because `onLoad` means the
    // frame arrived, not that the player inside it is awake — on a phone it
    // frequently is not, and the first handshake is simply lost.
    if (nudgeTimer.current) clearInterval(nudgeTimer.current);
    nudges.current = 0;
    nudgeTimer.current = setInterval(() => {
      if (awake.current || nudges.current >= NUDGE_TRIES) {
        if (nudgeTimer.current) clearInterval(nudgeTimer.current);
        nudgeTimer.current = null;
        return;
      }
      nudges.current += 1;
      listen();
      post("playVideo");
    }, NUDGE_EVERY_MS);
  }, [listen, post]);

  // A bed or a track left running keeps playing over the next page, which is
  // the same reason the hub tears its own context down.
  useEffect(() => {
    return () => {
      if (minTimer.current) clearTimeout(minTimer.current);
      if (maxTimer.current) clearTimeout(maxTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (nudgeTimer.current) clearInterval(nudgeTimer.current);
      if (glyphTimer.current) clearTimeout(glyphTimer.current);
      if (leadTimer.current) clearTimeout(leadTimer.current);
    };
  }, []);

  // ---------- SNOW, THE PICTURE ----------

  // Drawn at a low resolution and scaled up by the canvas itself, which is
  // both cheaper and coarser — closer to analogue snow than per-pixel noise.
  useEffect(() => {
    if (!tuning && !fading) return;
    const canvas = staticCanvas.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const W = (canvas.width = 160);
    const H = (canvas.height = 120);
    let frame = 0;

    const draw = () => {
      const img = ctx.createImageData(W, H);
      const px = img.data;
      for (let i = 0; i < px.length; i += 4) {
        const v = Math.random() * 255;
        px[i] = px[i + 1] = px[i + 2] = v;
        px[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(frame);
  }, [tuning, fading]);

  // `enablejsapi` exists only so the handshake above can be received, and
  // `origin` is what makes the player answer it rather than dropping it on the
  // floor. `playsinline` stops a phone tearing the video out into its own
  // fullscreen player the instant it starts.
  //
  // `mute` is now permanent. The embed is a picture and nothing else — the
  // sound it would have made is served from our own files instead — and a
  // muted embed is the one form of autoplay no browser has ever refused.
  const params =
    "controls=0&modestbranding=1&rel=0&showinfo=0&playsinline=1&autoplay=1&mute=1&enablejsapi=1" +
    (origin ? `&origin=${encodeURIComponent(origin)}` : "");

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
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background: "black",
          opacity: ready ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.6s ease",
          zIndex: 900,
        }}
      />

      <BackToMenu />

      {/* The channel's sound. Never seen and never controlled directly: it is
          wired into the AudioContext at mount, and from then on it is the
          filter and the gain that decide what any of it means.

          Deliberately no `key`. This element must outlive every channel change:
          `createMediaElementSource` may only be called on it once, and a
          remounted replacement would be a stranger to the graph — playing
          unfiltered, at full level, straight past everything below. The dial
          changes its src and reloads it in place instead. */}
      <audio
        ref={musicEl}
        src={current.audio ?? undefined}
        preload="auto"
        aria-hidden
        style={{ display: "none" }}
      />

      {/* === SIZE LIKE THE MENU BACKGROUND (same logic) === */}
      <div
        style={{
          position: "relative",
          width: "min(100vw, 900px)",
          height: "min(calc(100vw * 1.4), 1260px)",
          maxWidth: "900px",
          maxHeight: "1260px",
        }}
      >
        {/* === THE PICTURE === */}
        <div style={layer(20, true)}>
          {/* Remounting on the channel is what actually swaps the video: the
              embed ignores a changed `src` once it has booted. It mounts the
              moment the set is switched on — i.e. behind the snow — so the
              load happens during the noise instead of after it. */}
          {on && (
            /* The screen's tilt lives on this box, not on the iframe. Mobile
               WebKit will not paint a cross-origin iframe that is itself
               3D-transformed — the picture comes up blank, or comes up once and
               then never repaints — but it has no trouble with a flat iframe
               sitting inside a transformed box. */
            <div style={SCREEN}>
              <iframe
                ref={embed}
                key={current.id}
                src={`https://www.youtube.com/embed/${current.id}?${params}`}
                title={current.label}
                onLoad={onEmbedLoad}
                allow="autoplay; encrypted-media; picture-in-picture"
                style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        {/* === GLASS === */}
        {/* A transparent sheet over the picture, so the pointer never reaches
            the embed. Without it, moving the mouse across the screen wakes
            YouTube's own play/pause overlay and title bar, which breaks the
            illusion that this is a television. */}
        {on && (
          <div aria-hidden style={layer(60, true)}>
            <div style={{ ...SCREEN, cursor: "default" }} />
          </div>
        )}

        {/* === THE DEAD SCREEN AND THE SNOW === */}
        {/* One layer, so black and noise dissolve into the picture together
            rather than cutting. Never pressable: the play ball painted into
            the frame is the way in. */}
        {(!on || tuning || fading) && (
          <div aria-hidden style={layer(80)}>
            <div
              style={{
                ...SCREEN,
                position: "relative",
                background: "#000",
                opacity: !on || tuning ? 1 : 0,
                transition: `opacity ${SNOW_FADE_MS}ms ease`,
              }}
            >
              {(tuning || fading) && (
                <canvas
                  ref={staticCanvas}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.85,
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* === PNG FRAME OVERLAY === */}
        <Image
          src="/next/image/tv_frame.png"
          alt="TV Frame"
          fill
          sizes={HUB_SIZES}
          priority
          onLoad={() => setFrameLoaded(true)}
          onError={() => setFrameLoaded(true)}
          style={{
            objectFit: "contain",
            objectPosition: "center",
            pointerEvents: "none",
            zIndex: 200,
          }}
        />

        {/* === THE TWO BALLS === */}
        {/* Invisible, like every other control in the project: they sit on the
            symbols already painted into the frame. */}
        <button
          type="button"
          aria-label={on ? "Turn the television off" : "Turn the television on"}
          tabIndex={-1}
          onClick={togglePower}
          style={{ ...BALL_STYLE, ...PLAY_BALL }}
        />
        <button
          type="button"
          aria-label="Next channel"
          tabIndex={-1}
          onClick={turnDial}
          style={{ ...BALL_STYLE, ...NEXT_BALL }}
        />
      </div>
    </main>
  );
}
