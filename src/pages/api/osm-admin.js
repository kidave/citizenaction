import { supabaseNode } from "@/lib/supabase/node";

// Jurisdiction lookup is backed by the Supabase OSM cache and only falls back to Overpass on cache misses.

const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function escapeOverpassRegex(value) {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function escapeOverpassQuoted(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toLineGeoJSON(element) {
  const lines = Array.isArray(element?.members)
    ? element.members
        .filter((member) => member.type === "way" && Array.isArray(member.geometry))
        .map((member) =>
          member.geometry
            .filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)))
            .map((point) => [Number(point.lon), Number(point.lat)]),
        )
        .filter((line) => line.length >= 2)
    : [];

  return lines.length ? { type: "MultiLineString", coordinates: lines } : null;
}

function inferLocalGovernmentType(tags, adminLevel) {
  const explicit = tags["local_authority:IN"] || null;
  if (explicit) return explicit;

  if (adminLevel === 8) {
    const text = [tags.operator, tags["operator:alt_name"], tags.official_name, tags.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (text.includes("municipal corporation")) return "municipal_corporation";
    if (text.includes("municipality")) return "municipality";
    if (text.includes("city council")) return "city_council";
    if (text.includes("nagar panchayat")) return "nagar_panchayat";
  }

  return null;
}

function mapElement(element, fallbackLevel = null) {
  const tags = element?.tags || {};
  const adminLevel = Number(tags.admin_level || fallbackLevel || 0) || null;
  const center = element?.center
    ? {
        lat: Number(element.center.lat),
        lng: Number(element.center.lon ?? element.center.lng),
      }
    : null;

  return {
    osm_type: element.type,
    osm_id: element.id,
    name: tags.name || tags["name:en"] || tags.official_name || "Unnamed area",
    official_name: tags.official_name || null,
    admin_level: adminLevel,
    boundary: tags.boundary || null,
    local_authority: tags["local_authority:IN"] || null,
    local_government_type: inferLocalGovernmentType(tags, adminLevel),
    operator: tags.operator || null,
    operator_alt_name: tags["operator:alt_name"] || null,
    ward: tags.ward || null,
    ref: tags.ref || null,
    center,
    geojson: toLineGeoJSON(element),
  };
}

function getParentRelationId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

function sortResults(results) {
  return results.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function scopeKey(level, parentRelationId) {
  return parentRelationId
    ? `${level}:relation:${parentRelationId}`
    : `${level}:root`;
}

async function readCache({ level, parentRelationId, limit }) {
  if (level === 4) {
    let query = supabaseNode
      .from("osm_jurisdiction_cache")
      .select("osm_type, osm_id, name, official_name, admin_level, boundary, local_authority, local_government_type, operator, operator_alt_name, ward, ref, center, geojson")
      .eq("admin_level", level)
      .order("name", { ascending: true })
      .limit(limit);

    query = parentRelationId
      ? query.eq("parent_osm_type", "relation").eq("parent_osm_id", parentRelationId)
      : query.is("parent_osm_id", null);

    const { data, error } = await query;
    return {
      complete: !error && Array.isArray(data) && data.length > 0,
      results: !error && Array.isArray(data) ? data : [],
    };
  }

  const { data: scope, error: scopeError } = await supabaseNode
    .from("osm_jurisdiction_cache_scope")
    .select("is_complete")
    .eq("scope_key", scopeKey(level, parentRelationId))
    .maybeSingle();

  if (scopeError || !scope?.is_complete) return { complete: false, results: [] };

  let query = supabaseNode
    .from("osm_jurisdiction_cache")
    .select("osm_type, osm_id, name, official_name, admin_level, boundary, local_authority, local_government_type, operator, operator_alt_name, ward, ref, center, geojson")
    .eq("admin_level", level)
    .order("name", { ascending: true })
    .limit(limit);

  if (parentRelationId) {
    query = query.eq("parent_osm_type", "relation").eq("parent_osm_id", parentRelationId);
  } else {
    query = query.is("parent_osm_id", null);
  }

  const { data, error } = await query;
  return {
    complete: !error,
    results: !error && Array.isArray(data) ? data : [],
  };
}

async function writeCache(results, { level, parentRelationId, stateOsmId }) {
  const rows = results.map((item) => ({
    osm_type: item.osm_type,
    osm_id: item.osm_id,
    name: item.name,
    official_name: item.official_name,
    admin_level: item.admin_level || level,
    boundary: item.boundary,
    local_authority: item.local_authority,
    local_government_type: item.local_government_type,
    operator: item.operator,
    operator_alt_name: item.operator_alt_name,
    ward: item.ward,
    ref: item.ref,
    center: item.center,
    geojson: item.geojson,
    parent_osm_type: parentRelationId ? "relation" : null,
    parent_osm_id: parentRelationId,
    state_osm_id: stateOsmId || (level === 4 ? item.osm_id : null),
    source: "openstreetmap",
    source_url: `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`,
    fetched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  if (rows.length) {
    const { error } = await supabaseNode
      .from("osm_jurisdiction_cache")
      .upsert(rows, { onConflict: "osm_type,osm_id" });

    if (error) console.error("OSM jurisdiction cache write failed", error);
  }

  if (level !== 4) {
    const now = new Date().toISOString();
    const { error } = await supabaseNode
      .from("osm_jurisdiction_cache_scope")
      .upsert(
        {
          scope_key: scopeKey(level, parentRelationId),
          admin_level: level,
          parent_osm_type: parentRelationId ? "relation" : null,
          parent_osm_id: parentRelationId,
          state_osm_id: stateOsmId || null,
          is_complete: true,
          fetched_at: now,
          updated_at: now,
        },
        { onConflict: "scope_key" },
      );

    if (error) console.error("OSM jurisdiction cache scope write failed", error);
  }
}

async function runOverpass(overpassQuery) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "CitizenActionApp/1.0",
        },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`Overpass returned ${response.status}`);
        error.status = response.status;
        error.body = body.slice(0, 500);
        throw error;
      }

      return response.json();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Overpass request failed");
}

function parseResults(data, level) {
  return sortResults(
    (Array.isArray(data?.elements) ? data.elements : [])
      .filter((item) => item.type === "relation" && item.id && (item.tags?.name || item.tags?.["name:en"]))
      .map((item) => mapElement(item, level)),
  );
}

export default async function handler(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const adminLevel = typeof req.query.admin_level === "string" ? req.query.admin_level.trim() : "";
  const parentOsmId = typeof req.query.parent_osm_id === "string" ? req.query.parent_osm_id.trim() : "";
  const localAuthority = typeof req.query.local_authority === "string" ? req.query.local_authority.trim() : "";
  const boundaryType = typeof req.query.boundary_type === "string" ? req.query.boundary_type.trim() : "";
  const stateName = typeof req.query.state_name === "string" ? req.query.state_name.trim() : "";
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const list = req.query.list === "1" || req.query.list === "true";
  const includeGeometry = req.query.include_geometry !== "0";
  const requestedLimit = Number(req.query.limit || 500);
  const limit = Number.isSafeInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 500;

  if (adminLevel && !/^([2-9]|10)$/.test(adminLevel)) return res.status(400).json({ results: [] });
  if (!query && !list && !city) return res.status(400).json({ results: [] });

  const level = adminLevel ? Number(adminLevel) : null;
  const parentRelationId = getParentRelationId(parentOsmId);
  if (parentOsmId && !parentRelationId) return res.status(400).json({ results: [] });

  if (list && level >= 4 && level <= 10 && !query && !city) {
    const cached = await readCache({ level, parentRelationId, limit });
    if (cached.complete) {
      res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
      return res.status(200).json({ results: cached.results, cached: true });
    }
  }

  const nameFilter = query ? `["name"~"${escapeOverpassRegex(query)}",i]` : "";
  const levelFilter = level ? `["admin_level"="${level}"]` : "";
  const boundaryFilter = boundaryType ? `["boundary"="${escapeOverpassQuoted(boundaryType)}"]` : "";
  const useLocalAuthorityFilter = localAuthority && level !== 9 && level !== 10;
  const localAuthorityFilter = useLocalAuthorityFilter
    ? `["local_authority:IN"="${escapeOverpassQuoted(localAuthority)}"]`
    : "";

  let overpassQuery;
  let stateOsmId = null;

  if (stateName && level === 8) {
    const escapedState = escapeOverpassQuoted(stateName);
    stateOsmId = parentRelationId;
    overpassQuery = `[out:json][timeout:30];
area["boundary"="administrative"]["admin_level"="4"]["name:en"="${escapedState}"]->.stateArea;
(
  rel["type"="boundary"]["admin_level"="8"]["is_in:state"="${escapedState}"]${nameFilter};
  rel["type"="boundary"]["boundary"="local_authority"]["admin_level"="8"]["local_authority:IN"~"municipal_corporation|municipality|nagar_panchayat"](area.stateArea)${nameFilter};
);
out tags center ${limit};`;
  } else if (parentRelationId) {
    const areaId = 3600000000 + parentRelationId;
    overpassQuery = `[out:json][timeout:45];
area(id:${areaId})->.parentArea;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${localAuthorityFilter}${nameFilter}(area.parentArea);
out tags center ${limit};`;
  } else if (level === 2) {
    overpassQuery = `[out:json][timeout:45];
rel["type"="boundary"]["boundary"="administrative"]${levelFilter}${nameFilter};
out tags center ${limit};`;
  } else if (city) {
    const escapedCity = escapeOverpassQuoted(city);
    overpassQuery = `[out:json][timeout:45];
area["name"="${escapedCity}"]["boundary"="administrative"]->.cityArea;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${localAuthorityFilter}${nameFilter}(area.cityArea);
out tags center ${limit};`;
  } else {
    overpassQuery = `[out:json][timeout:45];
area["ISO3166-1"="IN"]["boundary"="administrative"]->.india;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${localAuthorityFilter}${nameFilter}(area.india);
out tags center ${limit};`;
  }

  try {
    let data;
    try {
      data = await runOverpass(overpassQuery);
    } catch (error) {
      if (!(stateName && level === 8)) throw error;

      const escapedState = escapeOverpassQuoted(stateName);
      const fallbackQuery = `[out:json][timeout:60];
area["boundary"="administrative"]["admin_level"="4"]["name:en"="${escapedState}"]->.stateArea;
rel["type"="boundary"]["boundary"="administrative"]["admin_level"="5"](area.stateArea)->.stateDistricts;
.stateDistricts map_to_area -> .districtAreas;
rel["type"="boundary"]["admin_level"="8"](area.districtAreas);
out tags center ${limit};`;
      data = await runOverpass(fallbackQuery);
    }

    const results = parseResults(data, level);
    await writeCache(results, { level, parentRelationId, stateOsmId });

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ results, cached: false });
  } catch (error) {
    console.error("Overpass administrative search error", error.status || 500, error.body || error.message);

    const stale = await readCache({ level, parentRelationId, limit });
    if (stale.complete) return res.status(200).json({ results: stale.results, cached: true, stale: true });

    return res.status(502).json({ results: [] });
  }
}
