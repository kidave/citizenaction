// scripts/snap_images_to_roads.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// configuration
const BATCH_SIZE = 100;          // images processed per loop
const MAX_DISTANCE_M = 30;       // max snap distance in meters
const DELAY_MS = 150;            // small delay between RPCs to be gentle

async function fetchBatch() {
  // fetch images missing road_fid and that have a geom
  const { data, error } = await supabase
    .from("mapillary_images_raw")
    .select("id")
    .is("road_fid", null)
    .not("geom", "is", null)
    .limit(BATCH_SIZE);

  if (error) {
    throw error;
  }
  return data || [];
}

async function snapImage(id) {
  // call RPC
  const { data, error } = await supabase
    .rpc("assign_image_to_road", { p_image_id: id, p_max_distance_m: MAX_DISTANCE_M });

  if (error) {
    console.error("RPC error for", id, error);
    return { id, ok: false, error };
  }
  return { id, ok: true, result: data };
}

async function main() {
  console.log("Starting snapping process...");
  let total = 0;

  while (true) {
    const batch = await fetchBatch();
    if (!batch || batch.length === 0) {
      console.log("No more unsnapped images found. Exiting.");
      break;
    }

    console.log(`Processing batch of ${batch.length} images...`);
    for (const row of batch) {
      const id = row.id;
      try {
        const out = await snapImage(id);
        if (out.ok && out.result && out.result.ok) {
          console.log("SNAPPED:", id, out.result);
        } else {
          console.log("NOT_SNAPPED:", id, out.result || out.error);
        }
      } catch (err) {
        console.error("Fatal error processing", id, err);
      }
      total++;
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("Done. Total attempted:", total);
  process.exit(0);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
