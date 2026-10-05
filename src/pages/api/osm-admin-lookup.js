const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/lookup";
const OVERPASS_ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

function withTimeout(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timeout) };
}

async function fetchFromNominatim(osmId) {
  const { controller, clear } = withTimeout(12000);
  try {
    const url = new URL(NOMINATIM_ENDPOINT);
    url.searchParams.set("osm_ids", `R${osmId}`);
    url.searchParams.set("format", "json");
    url.searchParams.set("polygon_geojson", "1");
    url.searchParams.set("addressdetails", "0");

    const response = await fetch(url, {
      headers: { "User-Agent": "CitizenActionApp/1.0 (geography boundary lookup)" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : null;
    if (!result?.geojson) return null;

    return {
      type: "Feature",
      properties: result.address || {},
      geometry: result.geojson,
    };
  } finally {
    clear();
  }
}

async function fetchFromOverpass(osmId) {
  const query = `[out:json][timeout:45];rel(${osmId});out geom;`;
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const { controller, clear } = withTimeout(15000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "CitizenActionApp/1.0 (geography boundary lookup)",
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Overpass returned ${response.status}`);

      const data = await response.json();
      const relation = Array.isArray(data?.elements)
        ? data.elements.find((element) => element.type === "relation" && Number(element.id) === Number(osmId))
        : null;
      if (!relation) return null;

      const lines = (relation.members || [])
        .filter((member) => member.type === "way" && Array.isArray(member.geometry))
        .map((member) => member.geometry
          .filter((point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lon)))
          .map((point) => [Number(point.lon), Number(point.lat)]))
        .filter((line) => line.length >= 2);

      if (!lines.length) return null;
      return {
        type: "Feature",
        properties: relation.tags || {},
        geometry: { type: "MultiLineString", coordinates: lines },
      };
    } catch (error) {
      lastError = error;
    } finally {
      clear();
    }
  }

  throw lastError || new Error("OSM boundary lookup failed");
}

export default async function handler(req, res) {
  const osmType = typeof req.query.osm_type === "string" ? req.query.osm_type.toUpperCase() : "";
  const osmId = typeof req.query.osm_id === "string" ? req.query.osm_id.trim() : "";

  if (osmType !== "RELATION" || !/^\\d+$/.test(osmId)) {
    return res.status(400).json({ feature: null });
  }

  try {
    let feature = null;
    try {
      feature = await fetchFromNominatim(osmId);
    } catch (error) {
      console.warn("Nominatim geography lookup failed", error?.message || error);
    }

    if (!feature) {
      feature = await fetchFromOverpass(osmId);
    }

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ feature });
  } catch (error) {
    console.error("OSM administrative lookup error", error?.message || error);
    return res.status(502).json({ feature: null });
  }
}
