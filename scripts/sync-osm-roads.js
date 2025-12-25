import fetch from "node-fetch";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const headers = {
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const RUN_STARTED_AT = new Date().toISOString();

/* -----------------------------
   1. FETCH OSM ROADS (MMR)
-------------------------------- */

async function fetchOSMRoads() {
  const overpassQuery = `
  [out:json][timeout:300];
  area["name"="Mumbai Metropolitan Region"]->.mmr;
  (
    way["highway"](area.mmr);
  );
  out tags geom;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });

  const text = await res.text();

  // 🔍 SAFETY CHECK (VERY IMPORTANT)
  if (!text.trim().startsWith("{")) {
    console.error("Overpass non-JSON response:", text.slice(0, 500));
    throw new Error("Overpass did not return JSON");
  }

  const data = JSON.parse(text);
  return data.elements.filter(e => e.type === "way");
}


/* -----------------------------
   2. UPSERT ROADS
-------------------------------- */

async function upsertRoad(way) {
  const coords = way.geometry
    .map(p => `${p.lon} ${p.lat}`)
    .join(", ");

  const geomWKT = `SRID=4326;MULTILINESTRING((${coords}))`;

  const body = {
    osm_id: String(way.id),
    name: way.tags?.name ?? null,
    ref: way.tags?.ref ?? null,
    fclass: way.tags?.highway ?? null,
    oneway: way.tags?.oneway ?? null,
    maxspeed: way.tags?.maxspeed
      ? parseInt(way.tags.maxspeed)
      : null,
    bridge: way.tags?.bridge ?? null,
    tunnel: way.tags?.tunnel ?? null,
    geom: geomWKT,
    osm_last_seen: RUN_STARTED_AT,
    updated_at: RUN_STARTED_AT,
    deleted_at: null,
  };


  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/roads?on_conflict=osm_id`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("Upsert failed:", t);
  }
}

/* -----------------------------
   3. SOFT DELETE MISSING ROADS
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

/* -----------------------------
   4. RECOMPUTE WARD CODE
-------------------------------- */

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

  for (const way of roads) {
    await upsertRoad(way);
  }

  await softDeleteMissing();
  await recomputeWards();

  console.log("OSM sync complete");
})();
