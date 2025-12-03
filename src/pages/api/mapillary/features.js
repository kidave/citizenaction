// pages/api/mapillary/features.js
import { query } from "lib/db";

export default async function handler(req, res) {
  try {
    const { bbox } = req.query;

    if (!bbox) {
      return res.status(400).json({ error: "bbox required" });
    }

    const token = process.env.MAPILLARY_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "MAPILLARY_TOKEN missing" });
    }

    // ALWAYS BUILD RAW URL (NO ENCODING)
    const url = `https://graph.mapillary.com/map_features?access_token=${token}&fields=id,geometry,object_value,object_type&bbox=${bbox}&limit=2000`;

    console.log("📡 FETCH:", url);

    const response = await fetch(url);
    const json = await response.json();

    console.log("📦 RAW JSON:", json);

    const items = json.data || [];

    console.log("📌 MAP FEATURES FOUND:", items.length);

    if (items.length === 0) {
      return res.json({ imported: 0 });
    }

    // Insert each feature
    for (const f of items) {
      const [lon, lat] = f.geometry.coordinates;

      await query(
        `INSERT INTO mapillary_features 
          (id, object_value, object_type, geom, metadata)
         VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326), $6)
         ON CONFLICT (id)
         DO UPDATE SET
            object_value = EXCLUDED.object_value,
            metadata = EXCLUDED.metadata`,
        [
          f.id,
          f.object_value,
          f.object_type,
          lon,
          lat,
          JSON.stringify(f)
        ]
      );
    }

    return res.json({ imported: items.length });

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
