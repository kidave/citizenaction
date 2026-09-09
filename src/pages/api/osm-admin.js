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
            .filter(
              (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)),
            )
            .map((point) => [Number(point.lon), Number(point.lat)]),
        )
        .filter((line) => line.length >= 2)
    : [];

  if (!lines.length) return null;

  return {
    type: "MultiLineString",
    coordinates: lines,
  };
}

function mapElement(element, fallbackLevel = null) {
  const tags = element?.tags || {};
  const adminLevel = Number(tags.admin_level || fallbackLevel || 0) || null;

  return {
    osm_type: element.type,
    osm_id: element.id,
    name: tags.name || tags["name:en"] || tags.official_name || "Unnamed area",
    official_name: tags.official_name || null,
    admin_level: adminLevel,
    boundary: tags.boundary || null,
    local_authority: tags["local_authority:IN"] || null,
    ward: tags.ward || null,
    ref: tags.ref || null,
    center: element.center || null,
    geojson: toLineGeoJSON(element),
  };
}

function getParentRelationId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

export default async function handler(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const adminLevel = typeof req.query.admin_level === "string" ? req.query.admin_level.trim() : "";
  const parentOsmId = typeof req.query.parent_osm_id === "string" ? req.query.parent_osm_id.trim() : "";
  const localAuthority = typeof req.query.local_authority === "string" ? req.query.local_authority.trim() : "";
  const boundaryType = typeof req.query.boundary_type === "string" ? req.query.boundary_type.trim() : "";
  const list = req.query.list === "1" || req.query.list === "true";
  const includeGeometry = req.query.include_geometry !== "0";
  const requestedLimit = Number(req.query.limit || 500);
  const limit = Number.isSafeInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 1000)
    : 500;

  if (adminLevel && !/^([2-9]|10)$/.test(adminLevel)) {
    return res.status(400).json({ results: [] });
  }

  if (!query && !list) {
    return res.status(400).json({ results: [] });
  }

  const clauses = [];
  const level = adminLevel ? Number(adminLevel) : null;
  const parentRelationId = getParentRelationId(parentOsmId);

  if (parentOsmId && !parentRelationId) {
    return res.status(400).json({ results: [] });
  }

  const nameFilter = query ? `["name"~"${escapeOverpassRegex(query)}",i]` : "";
  const levelFilter = level ? `["admin_level"="${level}"]` : "";
  const boundaryFilter = boundaryType ? `["boundary"="${escapeOverpassQuoted(boundaryType)}"]` : "";
  const localAuthorityFilter = localAuthority
    ? `["local_authority:IN"="${escapeOverpassQuoted(localAuthority)}"]`
    : "";

  if (parentRelationId) {
    clauses.push(`area(id:${3600000000 + parentRelationId})->.parentArea;`);
    clauses.push(
      `rel["type"="boundary"]${boundaryFilter}${levelFilter}${localAuthorityFilter}${nameFilter}(area.parentArea);`,
    );
  } else if (level === 2) {
    clauses.push(
      `rel["type"="boundary"]["boundary"="administrative"]${levelFilter}${nameFilter};`,
    );
  } else {
    clauses.push(`area["ISO3166-1"="IN"]["boundary"="administrative"]->.india;`);
    clauses.push(
      `rel["type"="boundary"]${boundaryFilter}${levelFilter}${localAuthorityFilter}${nameFilter}(area.india);`,
    );
  }

  const output = includeGeometry ? `out tags center geom ${limit};` : `out tags center ${limit};`;
  const overpassQuery = `[out:json][timeout:45];${clauses.join("\n")} ${output}`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "CitizenActionApp/1.0",
      },
      body: new URLSearchParams({ data: overpassQuery }).toString(),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Overpass administrative search failed", response.status, body.slice(0, 500));
      return res.status(502).json({ results: [] });
    }

    const data = await response.json();
    const results = (Array.isArray(data?.elements) ? data.elements : [])
      .filter((item) => item.type === "relation" && item.id && (item.tags?.name || item.tags?.["name:en"]))
      .map((item) => mapElement(item, level))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error("Overpass administrative search error", error);
    return res.status(500).json({ results: [] });
  }
}
