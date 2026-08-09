// All project/playlist data. No logic here — add a new album by appending an
// entry, as long as every referenced file exists under /public.
// Paths are case-sensitive in production (Linux), even though Windows dev
// tolerates a mismatch.

export type ButtonImage = { on: string; off: string };

export type TopButtonPos = { left: string; top: string; width: string; height: string };

export type OverlayLink = {
  href: string;
  left: string;
  top: string;
  width: string;
  height: string;
  label: string;
};

export type Project = {
  pageImg: string;
  mainImg: string;
  buttons: ButtonImage[];
  playlist: { src: string; titleImg: string }[];
  links?: OverlayLink[];
};

export const TOP_BUTTON_POSITIONS: TopButtonPos[] = [
  { left: "21.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "36.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "51.1%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "66.5%", top: "13.5%", width: "13%", height: "4.9%" },
  { left: "24%", top: "76%", width: "52%", height: "8.7%" },
  { left: "0%", top: "35%", width: "9%", height: "30%" }, // Button 6 (AboutMe)
];

export const BUTTON_LABELS = [
  "Play", "Pause", "Next Track", "Next Project", "Show Project Page", "Show About Me Page",
];

/** Index of each hotzone, so call sites read as names rather than numbers. */
export const BTN = {
  PLAY: 0,
  PAUSE: 1,
  NEXT_TRACK: 2,
  NEXT_PROJECT: 3,
  PAGE: 4,
  ABOUT: 5,
} as const;

export const projects: Project[] = [
  {
    mainImg: "/next/image/Fragments/Components/FragmentsCF.png",
    pageImg: "/next/image/Fragments/Components/FragmentsPAGE.png",
    buttons: [
      { on: "/next/image/Fragments/Buttons/Button 1 ON.png", off: "/next/image/Fragments/Buttons/Button 1 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 2 ON.png", off: "/next/image/Fragments/Buttons/Button 2 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 3 ON.png", off: "/next/image/Fragments/Buttons/Button 3 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button 4 On.png", off: "/next/image/Fragments/Buttons/Button 4 Off.png" },
      { on: "/next/image/Fragments/Buttons/Button5ON.png", off: "/next/image/Fragments/Buttons/Button5Off.png" },
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fragments/1Lidge.mp3", titleImg: "/next/image/Fragments/Titles/1Lidge.png" },
      { src: "/music/Fragments/2DoubleCrossed.mp3", titleImg: "/next/image/Fragments/Titles/2Doublecross.png" },
      { src: "/music/Fragments/3Walz.mp3", titleImg: "/next/image/Fragments/Titles/3Walz.png" },
      { src: "/music/Fragments/4TheRabbit.mp3", titleImg: "/next/image/Fragments/Titles/4Rabbit.png" },
      { src: "/music/Fragments/5Orphan.mp3", titleImg: "/next/image/Fragments/Titles/5Orphan.png" },
    ],
    links: [
      {
        href: "https://iconiaavantgarde.com/victor-clavelly-les-fragments-collection//",
        left: "25%", top: "56%", width: "25%", height: "7%",
        label: "Fragments Site",
      },
      {
        href: "https://instagram.com/victorclavelly",
        left: "30%", top: "49%", width: "30%", height: "7%",
        label: "VC Instagram",
      },
    ],
  },
  {
    mainImg: "/next/image/Aggragate/Components/AggragateCF.png",
    pageImg: "/next/image/Aggragate/Components/AggragatePAGE.png",
    buttons: [
      { on: "/next/image/Aggragate/Buttons/Button 1 ON.png", off: "/next/image/Aggragate/Buttons/Button 1 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 2 ON.png", off: "/next/image/Aggragate/Buttons/Button 2 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 3 ON.png", off: "/next/image/Aggragate/Buttons/Button 3 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button 4 On.png", off: "/next/image/Aggragate/Buttons/Button 4 Off.png" },
      { on: "/next/image/Aggragate/Buttons/Button5ON.png", off: "/next/image/Aggragate/Buttons/Button5Off.png" },
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Aggragate/1HighRiver.mp3", titleImg: "/next/image/Aggragate/Titles/1HighRiver.png" },
      { src: "/music/Aggragate/2AmongTheStorm.mp3", titleImg: "/next/image/Aggragate/Titles/2AmongTheStorm.png" },
      { src: "/music/Aggragate/3Spectacle.mp3", titleImg: "/next/image/Aggragate/Titles/3Spectacle.png" },
      { src: "/music/Aggragate/4Arrest.mp3", titleImg: "/next/image/Aggragate/Titles/4Arrest.png" },
      { src: "/music/Aggragate/5NoOnesEnnemy.mp3", titleImg: "/next/image/Aggragate/Titles/5NoOnesEnnemy.png" },
      { src: "/music/Aggragate/6PromessField.mp3", titleImg: "/next/image/Aggragate/Titles/6PromessField.png" },
      { src: "/music/Aggragate/7TheArena.mp3", titleImg: "/next/image/Aggragate/Titles/7TheArena.png" },
      { src: "/music/Aggragate/8ADisaster.mp3", titleImg: "/next/image/Aggragate/Titles/8ADisaster.png" },
      { src: "/music/Aggragate/9OfRustAndMirror.mp3", titleImg: "/next/image/Aggragate/Titles/9OfRustAndMirror.png" },
    ],
    links: [
      {
        href: "https://ninofiliu.com/aggregate/",
        left: "33.5%", top: "43%", width: "19%", height: "5%",
        label: "Aggregate Site",
      },
      {
        href: "https://www.instagram.com/moulsssss/",
        left: "55%", top: "47%", width: "23%", height: "5%",
        label: "Moul Instagram",
      },
      {
        href: "https://distraction.fun/",
        left: "55%", top: "54%", width: "18%", height: "7%",
        label: "Distraction Site",
      },
    ],
  },
  {
    mainImg: "/next/image/Fallcore/Components/FallcoreCF.png",
    pageImg: "/next/image/Fallcore/Components/FallcorePAGE.png",
    buttons: [
      { on: "/next/image/Fallcore/Buttons/Button 1 ON.png", off: "/next/image/Fallcore/Buttons/Button 1 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 2 ON.png", off: "/next/image/Fallcore/Buttons/Button 2 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 3 ON.png", off: "/next/image/Fallcore/Buttons/Button 3 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button 4 ON.png", off: "/next/image/Fallcore/Buttons/Button 4 Off.png" },
      { on: "/next/image/Fallcore/Buttons/Button5ON.png", off: "/next/image/Fallcore/Buttons/Button5Off.png" },
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/Fallcore/1Shutter.mp3", titleImg: "/next/image/Fallcore/Titles/1shutter.png" },
      { src: "/music/Fallcore/2Velith.mp3", titleImg: "/next/image/Fallcore/Titles/2Velith.png" },
      { src: "/music/Fallcore/3Animated.mp3", titleImg: "/next/image/Fallcore/Titles/3Animated.png" },
      { src: "/music/Fallcore/4AFriend.mp3", titleImg: "/next/image/Fallcore/Titles/4AFriend.png" },
    ],
    links: [
      {
        href: "https://www.youtube.com/watch?v=9vqVzGTkRU4",
        left: "63%", top: "60%", width: "15%", height: "7%",
        label: "Fallcore Velith",
      },
    ],
  },
  {
    mainImg: "/next/image/St4r/Components/St4rCF.png",
    pageImg: "/next/image/St4r/Components/St4rPAGE.png",
    buttons: [
      { on: "/next/image/St4r/Buttons/Button 1 ON.png", off: "/next/image/St4r/Buttons/Button 1 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 2 ON.png", off: "/next/image/St4r/Buttons/Button 2 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 3 ON.png", off: "/next/image/St4r/Buttons/Button 3 Off.png" },
      { on: "/next/image/St4r/Buttons/Button 4 On.png", off: "/next/image/St4r/Buttons/Button 4 Off.png" },
      { on: "/next/image/St4r/Buttons/Button5ON.png", off: "/next/image/St4r/Buttons/Button5Off.png" },
      { on: "/next/image/AboutMeButtonON.png", off: "/next/image/AboutMeButton.png" },
    ],
    playlist: [
      { src: "/music/St4r/1DesEtoiles.mp3", titleImg: "/next/image/St4r/Titles/1DesEtoiles.png" },
      { src: "/music/St4r/2Construction.mp3", titleImg: "/next/image/St4r/Titles/2Construction.png" },
      { src: "/music/St4r/3Escape.mp3", titleImg: "/next/image/St4r/Titles/3Escape.png" },
    ],
    links: [
      {
        href: "https://www.lefresnoy.net/en/exposition/1949/oeuvre/1900/",
        left: "60%", top: "44%", width: "15%", height: "6%",
        label: "St4r Fresnoy",
      },
      {
        href: "https://www.instagram.com/juliatarissan/",
        left: "45%", top: "58%", width: "31%", height: "6%",
        label: "St4r Julia",
      },
    ],
  },
];
