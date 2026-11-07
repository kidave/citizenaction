const fs = require("node:fs");
const path = require("node:path");

// MapLibre GL JS v6 is ESM-only and does not expose package.json through
// package exports, so resolve its worker from the installed package path.
const source = path.join(
  process.cwd(),
  "node_modules",
  "maplibre-gl",
  "dist",
  "maplibre-gl-worker.mjs",
);
const destination = path.join(process.cwd(), "public", "maplibre-gl-worker.mjs");

if (!fs.existsSync(source)) {
  throw new Error(`MapLibre worker not found at ${source}`);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log("Copied MapLibre GL worker to public/maplibre-gl-worker.mjs");
