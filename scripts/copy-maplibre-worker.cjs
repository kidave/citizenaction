const fs = require("node:fs");
const path = require("node:path");

const mapLibreEntry = require.resolve("maplibre-gl");
const source = path.join(path.dirname(mapLibreEntry), "maplibre-gl-worker.mjs");
const destination = path.join(process.cwd(), "public", "maplibre-gl-worker.mjs");

if (!fs.existsSync(source)) {
  throw new Error(`MapLibre worker not found at ${source}`);
}

fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.copyFileSync(source, destination);
console.log("Copied MapLibre GL worker to public/maplibre-gl-worker.mjs");
