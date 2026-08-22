export const TIMELINE_COLORS = [
  { name: "blue", line: "#2563eb", glow: "rgba(37,99,235,0.18)", dark: "#1d4ed8" },
  { name: "green", line: "#059669", glow: "rgba(5,150,105,0.18)", dark: "#047857" },
  { name: "amber", line: "#d97706", glow: "rgba(217,119,6,0.18)", dark: "#b45309" },
  { name: "violet", line: "#7c3aed", glow: "rgba(124,58,237,0.18)", dark: "#6d28d9" },
  { name: "pink", line: "#db2777", glow: "rgba(219,39,119,0.18)", dark: "#be185d" },
];

export function getTimelineColor(year, monthIndex = 0) {
  const index = Math.abs(Number(year || 0) + Number(monthIndex || 0)) % TIMELINE_COLORS.length;
  return TIMELINE_COLORS[index];
}
