export type ViewMode = "day" | "week";

export const API_URL = "/api/proxy";
export const CLASS_STORAGE_KEY = "schule_selected_class";
export const VIEW_STORAGE_KEY = "schule_view_mode";
export const MAX_LAST_UPDATED_HOURS = 10;

// Accent theme (yellow)
// Single hue (101.49) shared by every accent surface — only lightness/chroma
// vary between the bright fill, the deeper gradient stop, and the on-dark text.
export const ACCENT = {
  base: "oklch(0.9333 0.1567 101.49)",
  deep: "oklch(0.78 0.16 101.49)",
  mid: "oklch(0.85 0.15 101.49)",
  fg: "oklch(0.24 0.05 101.49)",
  soft: (a: number) => `oklch(0.9333 0.1567 101.49 / ${a})`,
  glow: (a: number) => `oklch(0.85 0.15 101.49 / ${a})`,
};

export const COL_HEADS = [
  "Klasse",
  "Std.",
  "Fehlender Lehrer",
  "Vertretung",
  "Fach",
  "Raum",
  "Info",
];
