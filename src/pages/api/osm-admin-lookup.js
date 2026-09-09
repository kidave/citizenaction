export default async function handler(req, res) {
  const osmType = typeof req.query.osm_type === "string" ? req.query.osm_type.toUpperCase() : "";
  const osmId = typeof req.query.osm_id === "string" ? req.query.osm_id.trim() : "";

  if (osmType !== "RELATION" || !/^\d+$/.test(osmId)) {
    return res.status(400).json({ feature: null });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/lookup");
    url.searchParams.set("osm_ids", `R${osmId}`);
    url.searchParams.set("format", "geojson");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("polygon_geojson", "1");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CitizenActionApp/1.0",
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const body = await response.text();
      console.error("OSM administrative lookup failed", response.status, body.slice(0, 500));
      return res.status(502).json({ feature: null });
    }

    const data = await response.json();
    return res.status(200).json({ feature: data?.features?.[0] || null });
  } catch (error) {
    console.error("OSM administrative lookup error", error);
    return res.status(500).json({ feature: null });
  }
}
