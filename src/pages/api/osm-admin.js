const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function escapeOverpassQuoted(value) {
  return String(value || "").replace(/\\\\/g, "\\\\\\\\").replace(/"/g, '\\"');
}

function getPositiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function sortResults(results) {
  return results.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

function parseResults(data, expectedLevel = 5) {
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  return sortResults(
    elements
      .filter((item) =>
        item?.type === "relation" &&
        Number(item?.id) > 0 &&
        item?.tags?.boundary === "administrative" &&
        Number(item?.tags?.admin_level) === expectedLevel &&
        (item?.tags?.name || item?.tags?.["name:en"] || item?.tags?.official_name),
      )
      .map((item) => {
        const tags = item.tags || {};
        const center = item.center && Number.isFinite(Number(item.center.lat)) && Number.isFinite(Number(item.center.lon))
          ? { lat: Number(item.center.lat), lng: Number(item.center.lon) }
          : null;
        return {
          osm_type: "relation",
          osm_id: Number(item.id),
          name: tags.name || tags["name:en"] || tags.official_name,
          official_name: tags.official_name || null,
          admin_level: expectedLevel,
          boundary: tags.boundary,
          ref: tags.ref || null,
          wikidata: tags.wikidata || null,
          iso3166_2: tags["ISO3166-2"] || null,
          center,
          source_url: `https://www.openstreetmap.org/relation/${item.id}`,
        };
      }),
  );
}

async function runOverpass(query) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "CitizenActionApp/1.0 (administrative geography import)",
        },
        body: new URLSearchParams({ data: query }).toString(),
      });

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`Overpass returned HTTP ${response.status}`);
        error.status = response.status;
        error.body = body.slice(0, 500);
        throw error;
      }

      const data = await response.json();
      if (data?.remark) {
        const error = new Error(`Overpass returned an incomplete result: ${data.remark}`);
        error.status = 502;
        throw error;
      }
      if (!Array.isArray(data?.elements)) {
        const error = new Error("Overpass response did not contain an elements array");
        error.status = 502;
        throw error;
      }
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("All Overpass endpoints failed");
}

function buildDistrictQuery({ parentRelationId, stateName, limit }) {
  if (parentRelationId) {
    const areaId = 3600000000 + parentRelationId;
    return `[out:json][timeout:90];
area(id:${areaId})->.stateArea;
rel["boundary"="administrative"]["admin_level"="5"](area.stateArea);
out tags center ${limit};`;
  }

  const escapedState = escapeOverpassQuoted(stateName);
  return `[out:json][timeout:90];
area["boundary"="administrative"]["admin_level"="4"]["name"="${escapedState}"]->.stateArea;
rel["boundary"="administrative"]["admin_level"="5"](area.stateArea);
out tags center ${limit};`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed", results: [] });
  }

  const adminLevel = Number(req.query.admin_level || 5);
  const list = req.query.list === "1" || req.query.list === "true";
  const parentRelationId = getPositiveInteger(req.query.parent_osm_id);
  const stateName = typeof req.query.state_name === "string" ? req.query.state_name.trim() : "";
  const requestedLimit = Number(req.query.limit || 1000);
  const limit = Number.isSafeInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 1000;

  if (!list || adminLevel !== 5 || (!parentRelationId && !stateName)) {
    return res.status(400).json({
      error: "District listing requires list=1, admin_level=5, and a parent_osm_id or state_name.",
      results: [],
    });
  }

  try {
    const data = await runOverpass(buildDistrictQuery({ parentRelationId, stateName, limit }));
    const results = parseResults(data, 5);

    // An empty result is not considered a successful fetch. It commonly indicates a
    // missing OSM area mapping, an incorrect parent relation, or a query mismatch.
    if (!results.length) {
      return res.status(502).json({
        error: "OSM returned no admin_level=5 administrative relations for this state.",
        results: [],
        complete: false,
        parent_osm_id: parentRelationId,
        state_name: stateName || null,
        osm_timestamp: data?.osm3s?.timestamp_osm_base || null,
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      results,
      complete: true,
      count: results.length,
      parent_osm_id: parentRelationId,
      state_name: stateName || null,
      osm_timestamp: data?.osm3s?.timestamp_osm_base || null,
      cached: false,
    });
  } catch (error) {
    console.error("OSM district fetch failed", error.status || 500, error.body || error.message);
    return res.status(502).json({
      error: "Unable to fetch a complete district list from OpenStreetMap.",
      details: error.message,
      results: [],
      complete: false,
      parent_osm_id: parentRelationId,
      state_name: stateName || null,
    });
  }
}
