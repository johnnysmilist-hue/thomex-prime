const colorMap: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  gray: "#6b7280",
  grey: "#6b7280",
  silver: "#c0c0c0",
  gold: "#d4af37",
  orange: "#f97316",
  brown: "#78350f",
  navy: "#1e3a8a",
  beige: "#e8dcc8",
  teal: "#14b8a6",
  maroon: "#7f1d1d",
};

export function getColorHex(name: string): string | null {
  return colorMap[name.trim().toLowerCase()] || null;
}
