import type { DevelopmentLevel } from "@/lib/baseball";

/** A cool→warm progression as players climb the ladder toward the show. */
export const LEVEL_COLORS: Record<DevelopmentLevel, string> = {
  UNSIGNED: "#94a3b8",
  SIGNED: "#64748b",
  COMPLEX: "#0ea5e9",
  LOW_A: "#06b6d4",
  HIGH_A: "#10b981",
  AA: "#84cc16",
  AAA: "#eab308",
  MLB: "#ef4444",
};

// SVG viewBox and road geometry.
export const VIEW_W = 1000;
export const VIEW_H = 640;

/** Winding road from the draft (bottom-left) up to the stadium (top-right). */
export const ROAD_PATH_D =
  "M 70 560 C 250 560 250 430 400 430 C 545 430 545 300 690 300 C 800 300 825 170 930 150";

export const MARKER_R = 13;
