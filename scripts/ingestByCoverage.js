// scripts/ingestByCoverage.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs/promises";
import fetch from "node-fetch";
import Pbf from "pbf";
import { VectorTile } from "@mapbox/vector-tile";

const MAPILLARY_TOKEN = process.env.MAPILLARY_TOKEN;
const INGESTION_ENDPOINT = process.env.INGESTION_ENDPOINT || "http://localhost:3000/api/mapillary/features";

// CONFIG
const Z = 14;                      // zoom level for coverage check (14 recommended)
const CONCURRENCY = 4;             // how many tiles to process concurrently (safe small number)
const TILE_WAIT_MS = 250;          // wait between ingestion requests (throttle)
const SAVE_CHECKPOINT_EVERY = 100; // write processed.json every N tiles

if (!MAPILLARY_TOKEN) {
  console.error("MAPILLARY_TOKEN missing in .env.local");
  process.exit(1);
}

// Mumbai extent — adjust if you want more/less
const MIN_LON = 72.80;
const MIN_LAT = 18.90;
const MAX_LON = 72.99;
const MAX_LAT = 19.30;

function lonLatToTile(lon, lat, z) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, z)
  );
  return { x, y, z };
}

function tile2bbox(x, y, z) {
  const n = Math.pow(2, z);
  const lon_deg_min = (x / n) * 360 - 180;
  const lon_deg_max = ((x + 1) / n) * 360 - 180;

  const lat_rad_min = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
  const lat_deg_min = (lat_rad_min * 180) / Math.PI;

  const lat_rad_max = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));
  const lat_deg_max = (lat_rad_max * 180) / Math.PI;

  // bbox order for Mapillary: minLon,minLat,maxLon,maxLat
  return [lon_deg_min, lat_deg_min, lon_deg_max, lat_deg_max];
}

function rangeTilesForBBox(minLon, minLat, maxLon, maxLat, z) {
  const topLeft = lonLatToTile(minLon, maxLat, z); // note maxLat
  const bottomRight = lonLatToTile(maxLon, minLat, z); // note minLat

  const tiles = [];
  for (let tx = topLeft.x; tx <= bottomRight.x; tx++) {
    for (let ty = topLeft.y; ty <= bottomRight.y; ty++) {
      tiles.push({ x: tx, y: ty, z });
    }
  }
  return tiles;
}

async function fetchTile(x, y, z) {
  const url = `https://tiles.mapillary.com/maps/vtp/mly1_public/2/${z}/${x}/${y}?access_token=${MAPILLARY_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) {
    // 4xx/5xx - return null
    return null;
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer);
}

function tileHasData(buffer) {
  try {
    const pbf = new Pbf(buffer);
    const vt = new VectorTile(pbf);

    // Mapillary uses layers like overview, sequence, image or computed coverage.
    // We'll treat presence of any layer with at least one feature as "has data".
    const layerNames = Object.keys(vt.layers || {});
    for (const lname of layerNames) {
      const layer = vt.layers[lname];
      if (layer && layer.length && layer.length > 0) return true;
    }
    return false;
  } catch (err) {
    // Can't decode tile (empty or not a vector tile)
    return false;
  }
}

async function ingestTile(tile) {
  const bboxArr = tile2bbox(tile.x, tile.y, tile.z);
  // Mapillary wants bbox as minLon,minLat,maxLon,maxLat with decimals
  const bbox = bboxArr.map((v) => v.toFixed(6)).join(",");
  const ingestUrl = `${INGESTION_ENDPOINT}?bbox=${bbox}`;

  // Call your ingestion endpoint (which inserts into DB)
  const r = await fetch(ingestUrl, { method: "GET" });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Ingest failed ${r.status} ${text}`);
  }
  const json = await r.json();
  return json;
}

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function run() {
  console.log("Scanning tiles (zoom", Z, ") inside bbox:", MIN_LON, MIN_LAT, MAX_LON, MAX_LAT);

  const tiles = rangeTilesForBBox(MIN_LON, MIN_LAT, MAX_LON, MAX_LAT, Z);
  console.log("Total tiles in box at z=" + Z + " =>", tiles.length);

  // resume support: processed.json keeps { "x_y_z": true }
  let processed = {};
  try {
    const raw = await fs.readFile("scripts/processed_tiles.json", "utf8");
    processed = JSON.parse(raw);
  } catch (err) {
    processed = {};
  }

  let processedCount = 0;
  let importedTotal = 0;
  let index = 0;

  for (const tile of tiles) {
    index++;
    const key = `${tile.x}_${tile.y}_${tile.z}`;
    if (processed[key]) {
      if (index % 50 === 0) console.log("Skipping processed", key);
      continue;
    }

    console.log(`Checking tile ${index}/${tiles.length} -> ${key}`);

    // fetch tile
    try {
      const buf = await fetchTile(tile.x, tile.y, tile.z);
      if (!buf) {
        console.log(" - tile fetch returned empty or 4xx");
        processed[key] = { checked: true, hasData: false };
      } else {
        const has = tileHasData(buf);
        console.log(" - hasData:", has);

        if (has) {
          // ingest (call your API)
          try {
            const result = await ingestTile(tile);
            console.log("   -> ingested:", result.imported);
            importedTotal += (result.imported || 0);
            processed[key] = { checked: true, hasData: true, imported: result.imported || 0 };
          } catch (err) {
            console.error("   -> ingest error:", err.message);
            processed[key] = { checked: true, hasData: true, error: err.message };
          }

          // respect rate limit
          await sleep(TILE_WAIT_MS);
        } else {
          processed[key] = { checked: true, hasData: false };
        }
      }
    } catch (err) {
      console.error(" - error:", err.message);
      processed[key] = { checked: true, error: err.message };
    }

    processedCount++;

    if (processedCount % SAVE_CHECKPOINT_EVERY === 0) {
      await fs.writeFile("scripts/processed_tiles.json", JSON.stringify(processed, null, 2), "utf8");
      console.log("Checkpoint saved:", processedCount, "tiles");
    }
  }

  // final save
  await fs.writeFile("scripts/processed_tiles.json", JSON.stringify(processed, null, 2), "utf8");
  console.log("DONE. Imported total:", importedTotal);
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
