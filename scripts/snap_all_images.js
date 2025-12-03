import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { supabaseNode } from "../src/utils/supabaseNode.js";

async function processBatch() {
  const { data: rows, error } = await supabaseNode.rpc("get_unsnapped_images", {
    batch_size: 50
  });

  if (error) {
    console.error("❌ Error loading batch:", error);
    return false;
  }

  if (!rows || rows.length === 0) {
    console.log("🎉 All images snapped!");
    return false;
  }

  console.log(`📦 Processing batch of ${rows.length} images`);

  for (const row of rows) {
    const { data, error } = await supabaseNode.rpc("snap_single_image", {
      p_image_id: row.id
    });

    if (error) {
      console.error("❌ snap error:", error);
    } else {
      console.log("📍 snapped:", row.id, data);
    }

    await new Promise(res => setTimeout(res, 50)); // avoid hammering DB
  }

  return true;
}

async function main() {
  while (await processBatch()) {
    console.log("➡ Next batch...");
  }
}

main();
