import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const minLon = 72.80;
const minLat = 18.90;
const maxLon = 72.99;
const maxLat = 19.30;

const tile = 0.005; // small bbox safe for detections

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  let total = 0;

  for (let lon = minLon; lon < maxLon; lon += tile) {
    for (let lat = minLat; lat < maxLat; lat += tile) {
      const bbox = `${lon},${lat},${lon + tile},${lat + tile}`;

      console.log("Fetching trees:", bbox);

      const res = await fetch(`http://localhost:3000/api/mapillary/trees?bbox=${bbox}`);
      const json = await res.json();

      console.log("Imported:", json.imported);
      total += json.imported;

      await wait(300); // avoid rate limits
    }
  }

  console.log("TOTAL TREES IMPORTED:", total);
}

main();
