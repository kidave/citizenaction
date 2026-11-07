export const OPENFREEMAP_STYLES = {
  positron: {
    id: "positron",
    label: "Positron",
    url: "https://tiles.openfreemap.org/styles/positron",
  },
  fiord: {
    id: "fiord",
    label: "Fiord",
    url: "https://tiles.openfreemap.org/styles/fiord",
  },
  bright: {
    id: "bright",
    label: "Bright",
    url: "https://tiles.openfreemap.org/styles/bright",
  },
};

/**
 * Resolve the basemap from the active CitizenAction appearance theme.
 * System appearance follows next-themes' resolvedTheme value.
 */
export function resolveOpenFreeMapStyle(theme, resolvedTheme) {
  if (theme === "space" || theme === "vintage") {
    return OPENFREEMAP_STYLES.bright;
  }

  if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
    return OPENFREEMAP_STYLES.fiord;
  }

  return OPENFREEMAP_STYLES.positron;
}
