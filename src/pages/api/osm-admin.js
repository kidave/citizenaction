const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function quoteOverpass(value) {
  // JSON string escaping is compatible with Overpass QL quoted string values.
  return JSON.stringify(String(value || ""));
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

function mapElement(item, fallbackLevel = null) {
  const tags = item?.tags || {};
  const adminLevel = Number(tags.admin_level || fallbackLevel || 0) || null;
  const center = item?.center &&
    Number.isFinite(Number(item.center.lat)) &&
    Number.isFinite(Number(item.center.lon))
    ? { lat: Number(item.center.lat), lng: Number(item.center.lon) }
    : null;

  return {
    osm_type: item.type,
    osm_id: Number(item.id),
    name: tags.name || tags["name:en"] || tags.official_name || "Unnamed area",
    official_name: tags.official_name || null,
    admin_level: adminLevel,
    boundary: tags.boundary || null,
    ref: tags.ref || null,
    wikidata: tags.wikidata || null,
    iso3166_2: tags["ISO3166-2"] || null,
    local_authority: tags["local_authority:IN"] || null,
    operator: tags.operator || null,
    center,
    source_url: `https://www.openstreetmap.org/${item.type}/${item.id}`,
  };
}

function parseResults(data, expectedLevel = null) {
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  return sortResults(
    elements
      .filter((item) =>
        item?.type === "relation" &&
        Number(item?.id) > 0 &&
        (item?.tags?.name || item?.tags?.["name:en"] || item?.tags?.official_name) &&
        (!expectedLevel || Number(item?.tags?.admin_level) === expectedLevel),
      )
      .map((item) => mapElement(item, expectedLevel)),
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

function buildQuery({ level, parentRelationId, stateName, city, query, limit }) {
  const nameFilter = query ? `["name"~${quoteOverpass(query)}i]` : "";
  const boundaryFilter = '["boundary"="administrative"]';
  const levelFilter = level ? `["admin_level"="${level}"]` : "";

  // Districts must be fetched from the selected state's OSM area, not from
  // the India-wide area. This prevents incomplete root-area results and makes
  // the state relationship explicit for the reconciliation step.
  if (level === 5 && parentRelationId) {
    const areaId = 3600000000 + parentRelationId;
    return `[out:json][timeout:90];
area(id:${areaId})->.parentArea;
rel${boundaryFilter}${levelFilter}${nameFilter}(area.parentArea);
out tags center ${limit};`;
  }

  if (level === 5 && stateName) {
    const state = quoteOverpass(stateName);
    return `[out:json][timeout:90];
(
  area["boundary"="administrative"]["admin_level"="4"]["name"=${state}];
  area["boundary"="administrative"]["admin_level"="4"]["name:en"=${state}];
)->.stateArea;
rel${boundaryFilter}${levelFilter}${nameFilter}(area.stateArea);
out tags center ${limit};`;
  }

  if (stateName && level === 8) {
    const state = quoteOverpass(stateName);
    return `[out:json][timeout:60];
area["boundary"="administrative"]["admin_level"="4"]["name:en"=${state}]->.stateArea;
(
  rel["type"="boundary"]["admin_level"="8"]["is_in:state"=${state}]${nameFilter};
  rel["type"="boundary"]["boundary"="local_authority"]["admin_level"="8"]["local_authority:IN"~"municipal_corporation|municipality|nagar_panchayat"](area.stateArea)${nameFilter};
);
out tags center ${limit};`;
  }

  if (parentRelationId) {
    const areaId = 3600000000 + parentRelationId;
    return `[out:json][timeout:60];
area(id:${areaId})->.parentArea;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${nameFilter}(area.parentArea);
out tags center ${limit};`;
  }

  if (level === 2) {
    return `[out:json][timeout:60];
rel["type"="boundary"]${boundaryFilter}${levelFilter}${nameFilter};
out tags center ${limit};`;
  }

  if (city) {
    const cityValue = quoteOverpass(city);
    return `[out:json][timeout:60];
area["name"=${cityValue}]["boundary"="administrative"]->.cityArea;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${nameFilter}(area.cityArea);
out tags center ${limit};`;
  }

  return `[out:json][timeout:90];
area["ISO3166-1"="IN"]["boundary"="administrative"]->.india;
rel["type"="boundary"]${boundaryFilter}${levelFilter}${nameFilter}(area.india);
out tags center ${limit};`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed", results: [] });
  }

  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const adminLevel = typeof req.query.admin_level === "string" ? req.query.admin_level.trim() : "";
  const stateName = typeof req.query.state_name === "string" ? req.query.state_name.trim() : "";
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const list = req.query.list === "1" || req.query.list === "true";
  const requestedLimit = Number(req.query.limit || 500);
  const limit = Number.isSafeInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 1000) : 500;
  const level = adminLevel ? Number(adminLevel) : null;
  const parentRelationId = getPositiveInteger(req.query.parent_osm_id);

  if (adminLevel && !/^([2-9]|10)$/.test(adminLevel)) {
    return res.status(400).json({ error: "Invalid admin_level", results: [] });
  }
  if (req.query.parent_osm_id && !parentRelationId) {
    return res.status(400).json({ error: "Invalid parent_osm_id", results: [] });
  }
  if (!query && !list && !city) {
    return res.status(400).json({ error: "Provide list=1, q, or city", results: [] });
  }
  if (level === 5 && !parentRelationId && !stateName) {
    return res.status(400).json({
      error: "District listing requires a state parent_osm_id or state_name.",
      results: [],
      complete: false,
    });
  }

  try {
    const data = await runOverpass(buildQuery({
      level,
      parentRelationId,
      stateName,
      city,
      query,
      limit,
    }));
    const results = parseResults(data, level);

    if (level === 5 && results.length === 0) {
      return res.status(502).json({
        error: "OSM returned no admin_level=5 administrative relations for this state.",
        results: [],
        complete: false,
        count: 0,
        parent_osm_id: parentRelationId,
        state_name: stateName || null,
        osm_timestamp: data?.osm3s?.timestamp_osm_base || null,
      });
    }

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      results,
      count: results.length,
      complete: !data?.remark,
      parent_osm_id: parentRelationId,
      state_name: stateName || null,
      osm_timestamp: data?.osm3s?.timestamp_osm_base || null,
      cached: false,
    });
  } catch (error) {
    console.error("OSM administrative fetch failed", error.status || 500, error.body || error.message);
    return res.status(502).json({
      error: "Unable to fetch a complete administrative list from OpenStreetMap.",
      details: error.message,
      results: [],
      complete: false,
      parent_osm_id: parentRelationId,
      state_name: stateName || null,
    });
  }
}
