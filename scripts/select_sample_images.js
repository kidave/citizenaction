// scripts/select_sample_images.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fetch from "node-fetch";
import { supabaseNode } from "../src/utils/supabaseNode.js";

/**
 * Robust lon/lat extractor for RPC sample point fields.
 * Handles:
 *  - GeoJSON object { type: "Point", coordinates: [lon, lat] }
 *  - GeoJSON string '{"type":"Point","coordinates":[lon,lat]}' 
 *  - hex WKB string '0101000020E6100000...'
 */
function extractLonLat(value) {
  if (!value) return null;

  // Already an object (GeoJSON)
  if (typeof value === "object") {
    if (Array.isArray(value.coordinates)) {
      return { lon: value.coordinates[0], lat: value.coordinates[1] };
    }
    // maybe nested: { geom: {...} }
    if (value.geom && value.geom.coordinates) {
      return { lon: value.geom.coordinates[0], lat: value.geom.coordinates[1] };
    }
    return null;
  }

  // It's a string
  if (typeof value === "string") {
    const s = value.trim();

    // JSON string
    if (s.startsWith("{")) {
      try {
        const obj = JSON.parse(s);
        if (obj && obj.coordinates) {
          return { lon: obj.coordinates[0], lat: obj.coordinates[1] };
        }
        if (obj.geom && obj.geom.coordinates) {
          return { lon: obj.geom.coordinates[0], lat: obj.geom.coordinates[1] };
        }
      } catch (e) {
        // fallthrough
      }
    }

    // Hex WKB (Postgres ST_AsBinary or direct WKB hex from RPC)
    // Heuristic: string of hex characters, often starts with '01' or '00' or '0101...'
    const hexCandidate = s.replace(/^0x/i, "");
    const isHex = /^[0-9a-fA-F]+$/.test(hexCandidate) && hexCandidate.length >= 2;
    if (isHex) {
      try {
        const buf = Buffer.from(hexCandidate, "hex");
        // WKB layout: 1 byte endian, 4 bytes type, then doubles
        // Byte 0: endian (1 = little, 0 = big)
        const littleEndian = buf.readUInt8(0) === 1;
        // type at bytes 1..4
        // read doubles at offset 5 and 13 (zero-based)
        // but Buffer APIs readDoubleLE/BE use offsets in bytes
        const xOffset = 5;
        const yOffset = 13;
        let lon, lat;
        if (littleEndian) {
          lon = buf.readDoubleLE(xOffset);
          lat = buf.readDoubleLE(yOffset);
        } else {
          lon = buf.readDoubleBE(xOffset);
          lat = buf.readDoubleBE(yOffset);
        }
        if (Number.isFinite(lon) && Number.isFinite(lat)) {
          return { lon, lat };
        }
      } catch (e) {
        // can't decode, return null
      }
    }
  }

  return null;
}

// haversine distance in meters
function haversine(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const rads = (d) => (d * Math.PI) / 180;
  const dLat = rads(lat2 - lat1);
  const dLon = rads(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rads(lat1)) * Math.cos(rads(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function bboxFromPoint(lon, lat, radiusDegrees = 0.0006) {
  // radius in degrees (~70m for radiusDegrees=0.0006)
  return `${lon - radiusDegrees},${lat - radiusDegrees},${lon + radiusDegrees},${lat + radiusDegrees}`;
}

const TOKEN = process.env.MAPILLARY_TOKEN;
if (!TOKEN) {
  console.error("MAPILLARY_TOKEN missing in env (.env.local).");
  process.exit(1);
}

// get samples RPC
async function getSamplesForWard(wardCode) {
  const { data, error } = await supabaseNode.rpc("generate_road_samples_for_ward", { gr_ward_code: wardCode });
  if (error) {
    throw error;
  }
  return data || [];
}

async function findNearestImageForPoint(lon, lat) {
  // expand region a bit, but keep small to limit irrelevant images
  const bbox = bboxFromPoint(lon, lat, 0.0007);
  const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&bbox=${bbox}&fields=id,computed_geometry,thumb_1024_url&limit=20`;
  const resp = await fetch(url);
  const json = await resp.json();
  if (!json || !Array.isArray(json.data) || json.data.length === 0) return null;

  let best = null;
  let bestD = Infinity;
  for (const img of json.data) {
    if (!img.computed_geometry || !Array.isArray(img.computed_geometry.coordinates)) continue;
    const [ilon, ilat] = img.computed_geometry.coordinates;
    const d = haversine(lon, lat, ilon, ilat);
    if (d < bestD) {
      bestD = d;
      best = { img, d };
    }
  }
  // accept within 80 meters (tune as you like)
  if (best && best.d <= 80) return best.img;
  return null;
}

async function main() {
  try {
    const wardCode = process.argv[2];
    if (!wardCode) {
      console.error("Usage: node scripts/select_sample_images.js <WARD_CODE>");
      process.exit(1);
    }

    console.log("👉 Fetching sampling points for ward:", wardCode);
    const samples = await getSamplesForWard(wardCode);
    console.log("📌 Total samples:", samples.length);

    for (const s of samples) {
      // points to try in order
      const tries = [
        { name: "center", value: s.center_pt, index: s.sample_index ?? 0 },
        { name: "left",   value: s.left_pt,   index: s.sample_index ?? 0 },
        { name: "right",  value: s.right_pt,  index: s.sample_index ?? 0 }
      ];

      let used = false;
      for (const t of tries) {
        const p = extractLonLat(t.value);
        if (!p || p.lon == null || p.lat == null) continue;

        console.log(`➡ Checking point (${t.name}): ${p.lon}, ${p.lat} (road_fid=${s.road_fid})`);
        const img = await findNearestImageForPoint(p.lon, p.lat);
        if (!img) {
          console.log(`⚠️ No image within range for point (${t.name})`);
          continue;
        }

        // Use computed geometry of image as image geom (where image actually is)
        const [ilon, ilat] = img.computed_geometry.coordinates;

        // Upsert into supabase; sample_point from sample geometry, geom from image geometry
        const upsertObj = {
          id: String(img.id),
          ward_code: s.ward_code || wardCode,
          road_fid: s.road_fid,
          sample_index: t.index,
          side: t.name,
          sample_point: `SRID=4326;POINT(${p.lon} ${p.lat})`,
          geom: `SRID=4326;POINT(${ilon} ${ilat})`,
          image_url: img.thumb_1024_url,
          downloaded: false
        };

        const { error: insertError } = await supabaseNode.from("mapillary_images_raw").upsert(upsertObj, { onConflict: "id" });

        if (insertError) {
          console.error("❌ Insert error:", insertError);
        } else {
          console.log("✅ Inserted:", img.id, "side:", t.name);
          used = true;
          break; // we found an image for this sample (don't try other sides for same sample)
        }
      }

      if (!used) {
        console.log(`❌ No image found for any side of sample road_fid=${s.road_fid}`);
      }

      // be polite with Mapillary rate limits
      await new Promise(r => setTimeout(r, 250));
    }

    console.log("🎉 DONE");
  } catch (err) {
    console.error("💥 Fatal script error:");
    console.error(err);
    process.exit(1);
  }
}

main();
