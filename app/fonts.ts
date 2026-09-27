import { IBM_Plex_Sans_Thai_Looped, Mitr, Zen_Maru_Gothic } from "next/font/google";

export const plexThai = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const mitr = Mitr({
  variable: "--font-mitr",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

export const fontVariables = `${plexThai.variable} ${mitr.variable} ${zenMaru.variable}`;
