const fs = require("node:fs");
const path = require("node:path");

const packageDist = path.join(
  process.cwd(),
  "node_modules",
  "maplibre-gl",
  "dist",
);
const publicDir = path.join(process.cwd(), "public");

// MapLibre GL JS v6's module worker imports maplibre-gl-shared.mjs at runtime.
// Both files must be served from the same directory in production.
const assets = [
  "maplibre-gl-worker.mjs",
  "maplibre-gl-shared.mjs",
];

fs.mkdirSync(publicDir, { recursive: true });

for (const asset of assets) {
  const source = path.join(packageDist, asset);
  const destination = path.join(publicDir, asset);

  if (!fs.existsSync(source)) {
    throw new Error(`MapLibre asset not found at ${source}`);
  }

  fs.copyFileSync(source, destination);
  console.log(`Copied ${asset} to public/`);
}
