// scripts/fetch_username_images.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fetch from "node-fetch";
import { supabaseNode } from "../src/utils/supabaseNode.js";

const RAW = process.env.MAPILLARY_TOKEN;
const TOKEN = encodeURIComponent(RAW);

if (!RAW) {
  console.error("❌ MAPILLARY_TOKEN missing in .env.local");
  process.exit(1);
}

/**
 * Insert a single image into Supabase
 */
async function upsertImage(img, username) {
  const { id, computed_geometry, thumb_1024_url, sequence_id, captured_at } = img;

  if (!computed_geometry || !computed_geometry.coordinates) return;

  const [lon, lat] = computed_geometry.coordinates;

  const row = {
    id: String(id),
    username,
    sequence_id,
    captured_at: captured_at ? new Date(captured_at).toISOString() : null,
    geom: `SRID=4326;POINT(${lon} ${lat})`,
    image_url: thumb_1024_url,
    downloaded: false
  };

  const { error } = await supabaseNode
    .from("mapillary_images_raw")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("❌ Insert error:", error);
  }
}

/**
 * Fetch up to 2000 images per page
 */
function normalizeUrl(url) {
  // Mapillary returns /v1.0/ in paging URLs — must normalize
  return url.replace("graph.mapillary.com/v1.0", "graph.mapillary.com");
}

async function fetchPage(url) {
  const finalURL = normalizeUrl(url);
  const res = await fetch(finalURL);

  const json = await res.json().catch(() => ({}));

  if (!json || !json.data) {
    console.log("⚠️ Mapillary returned empty or invalid JSON");
    return { images: [], next: null };
  }

  return {
    images: json.data,
    next: json.paging?.next ? normalizeUrl(json.paging.next) : null
  };
}


/**
 * Main ingestion logic
 */
async function fetchAllImagesForUser(username) {
  const baseURL =
    `https://graph.mapillary.com/images?` +
    `access_token=${TOKEN}` +
    `&creator_username=${username}` +
    `&fields=id,computed_geometry,thumb_1024_url,sequence_id,captured_at` +
    `&limit=2000`;

  let url = baseURL;
  let total = 0;

  while (url) {
    console.log("🔎 Fetching:", url);

    const { images, next } = await fetchPage(url);

    if (images.length === 0) {
      console.log("⚠️ No images returned — ending.");
      break;
    }

    for (const img of images) {
      await upsertImage(img, username);
      total++;
    }

    console.log(`📸 Imported so far: ${total}`);

    url = next;
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`🎉 DONE — Total images ingested for ${username}: ${total}`);
}

/**
 * Entry point when running script
 */
async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: node scripts/fetch_username_images.js <MAPILLARY_USERNAME>");
    process.exit(1);
  }

  await fetchAllImagesForUser(username);
}

main().catch(err => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
