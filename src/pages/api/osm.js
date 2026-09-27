export default async function handler(req, res) {
  const { q } = req.query;

  if (!q || typeof q !== "string" || !q.trim()) {
    return res.status(400).json([]);
  }

  try {
    const params = new URLSearchParams({
      format: "json",
      q: q.trim(),
      addressdetails: "1",
      countrycodes: "in",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "CitizenActionApp/1.0",
        },
      },
    );

    if (!response.ok) {
      return res.status(response.status).json([]);
    }

    const data = await response.json();

    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("OSM search failed:", err);
    return res.status(500).json([]);
  }
}
