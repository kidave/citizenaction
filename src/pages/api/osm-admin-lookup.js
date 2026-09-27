const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function relationToGeoJSON(element) {
  const members = Array.isArray(element?.members) ? element.members : [];

  const lines = members
    .filter((member) => member.type === "way" && Array.isArray(member.geometry))
    .map((member) =>
      member.geometry
        .filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)))
        .map((point) => [Number(point.lon), Number(point.lat)]),
    )
    .filter((line) => line.length >= 2);

  if (!lines.length) return null;

  // Keeping the relation's outer ways as a MultiLineString is deliberate here.
  // It preserves the authoritative OSM boundary without inventing polygon topology
  // when a relation contains multiple outer/inner rings or shared ways.
  return {
    type: "MultiLineString",
    coordinates: lines,
  };
}

async function fetchFromOverpass(osmId) {
  const query = `[out:json][timeout:90];rel(${osmId});out geom;`;
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "CitizenActionApp/1.0",
        },
        body: new URLSearchParams({ data: query }).toString(),
      });

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`Overpass returned ${response.status}`);
        error.status = response.status;
        error.body = body.slice(0, 500);
        throw error;
      }

      const data = await response.json();
      const relation = Array.isArray(data?.elements)
        ? data.elements.find((element) => element.type === "relation" && Number(element.id) === Number(osmId))
        : null;

      if (!relation) return null;

      return {
        type: "Feature",
        properties: relation.tags || {},
        geometry: relationToGeoJSON(relation),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("OSM relation lookup failed");
}

export default async function handler(req, res) {
  const osmType = typeof req.query.osm_type === "string" ? req.query.osm_type.toUpperCase() : "";
  const osmId = typeof req.query.osm_id === "string" ? req.query.osm_id.trim() : "";

  if (osmType !== "RELATION" || !/^\d+$/.test(osmId)) {
    return res.status(400).json({ feature: null });
  }

  try {
    const feature = await fetchFromOverpass(osmId);
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ feature });
  } catch (error) {
    console.error("OSM administrative lookup error", error.status || 500, error.body || error.message);
    return res.status(502).json({ feature: null });
  }
}
