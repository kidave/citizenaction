import "dotenv/config";
import fetch from "node-fetch";

/* -----------------------------
   CONFIG
-------------------------------- */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
}

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

const RUN_STARTED_AT = new Date().toISOString();
const BATCH_SIZE = 500;

/* -----------------------------
   OVERPASS CONFIG
-------------------------------- */

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter",
];

const BBOXES = [
  [18.70, 72.60, 19.10, 72.95],
  [18.70, 72.95, 19.10, 73.35],
  [19.10, 72.60, 19.50, 72.95],
  [19.10, 72.95, 19.50, 73.35],
  [19.50, 72.60, 19.80, 72.95],
  [19.50, 72.95, 19.80, 73.35],
  [19.80, 72.60, 20.10, 73.00],
  [18.90, 73.00, 19.30, 73.35],
];

/* -----------------------------
   OVERPASS FETCH
-------------------------------- */

async function fetchFromOverpass(endpoint, query) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  const text = await res.text();
  if (!text.trim().startsWith("{")) {
    throw new Error("Non-JSON Overpass response");
  }

  return JSON.parse(text);
}

async function fetchOSMRoads() {
  const allWays = new Map();

  for (const bbox of BBOXES) {
    const query = `
      [out:json][timeout:180];
      (
        way["highway"](${bbox.join(",")});
      );
      out tags geom;
    `;

    let data = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        data = await fetchFromOverpass(endpoint, query);
        break;
      } catch {
        console.warn(`Overpass failed at ${endpoint}, trying next mirror…`);
      }
    }

    if (!data) {
      throw new Error("All Overpass mirrors failed for bbox " + bbox.join(","));
    }

    for (const el of data.elements) {
      if (el.type === "way") {
        allWays.set(el.id, el);
      }
    }
  }

  return Array.from(allWays.values());
}

/* -----------------------------
   TRANSFORM → DB ROW
-------------------------------- */

function wayToRow(way) {
  const coords = way.geometry
    .map(p => `${p.lon} ${p.lat}`)
    .join(", ");

  return {
    osm_id: String(way.id),
    name: way.tags?.name ?? null,
    ref: way.tags?.ref ?? null,
    fclass: way.tags?.highway ?? null,
    oneway: way.tags?.oneway ?? null,
    maxspeed: way.tags?.maxspeed ? parseInt(way.tags.maxspeed) : null,
    bridge: way.tags?.bridge ?? null,
    tunnel: way.tags?.tunnel ?? null,
    geom: `SRID=4326;MULTILINESTRING((${coords}))`,
    osm_last_seen: RUN_STARTED_AT,
    updated_at: RUN_STARTED_AT,
    deleted_at: null,
  };
}

/* -----------------------------
   BATCH UPSERT
-------------------------------- */

async function upsertBatch(rows, batchNumber) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/roads?on_conflict=osm_id`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(rows),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Batch ${batchNumber} failed: ${t}`);
  }
}

/* -----------------------------
   POST-PROCESSING
-------------------------------- */

async function softDeleteMissing() {
  const sql = `
    update public.roads
    set deleted_at = '${RUN_STARTED_AT}'
    where osm_last_seen < '${RUN_STARTED_AT}'
      and deleted_at is null;
  `;

  await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql }),
  });
}

async function recomputeWards() {
  const sql = `
    with overlaps as (
      select
        r.fid,
        w.code as ward_code,
        ST_Length(
          ST_Intersection(r.geom, w.geom)::geography
        ) as overlap_len
      from public.roads r
      join public.ward w
        on ST_Intersects(r.geom, w.geom)
      where r.deleted_at is null
    ),
    ranked as (
      select *,
        row_number() over (
          partition by fid
          order by overlap_len desc
        ) as rn
      from overlaps
    )
    update public.roads r
    set ward_code = ranked.ward_code
    from ranked
    where r.fid = ranked.fid
      and ranked.rn = 1;
  `;

  await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql }),
  });
}

/* -----------------------------
   MAIN
-------------------------------- */

(async () => {
  const roads = await fetchOSMRoads();
  console.log(`Fetched ${roads.length} OSM roads`);

  const rows = roads.map(wayToRow);

  let batchNumber = 1;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch, batchNumber);
    console.log(`Upserted batch ${batchNumber} (${batch.length} rows)`);
    batchNumber++;
  }

  await softDeleteMissing();
  await recomputeWards();

  console.log("OSM sync complete");
})();
