// scripts/fetchMumbaiFeatures.js

import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Mumbai bounding box (corrected)
const minLon = 72.83;
const minLat = 19.03;
const maxLon = 72.88;
const maxLat = 19.10;

// tile size (approx 500m)
const tileLon = 0.005;
const tileLat = 0.005;

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  let total = 0;

  for (let lon = minLon; lon < maxLon; lon += tileLon) {
    for (let lat = minLat; lat < maxLat; lat += tileLat) {

      const bbox = `${lon},${lat},${lon + tileLon},${lat + tileLat}`;
      const url = `http://localhost:3000/api/mapillary/features?bbox=${bbox}`;

      console.log("🗺 Fetching tile:", bbox);

      try {
        const res = await fetch(url);
        const json = await res.json();

        console.log("➡ Imported:", json.imported);

        total += json.imported;
      } catch (err) {
        console.error("❌ Error fetching tile:", err.message);
      }

      await wait(300); // avoid Mapillary rate limits
    }
  }

  console.log("🎉 DONE — Total imported:", total);
}

main();
