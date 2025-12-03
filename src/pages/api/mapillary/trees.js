import { query } from "lib/db";

export default async function handler(req, res) {
  const { bbox } = req.query;

  if (!bbox) return res.status(400).json({ error: "bbox required" });

  const token = process.env.MAPILLARY_TOKEN;

  const url =
    `https://graph.mapillary.com/images?` +
    `access_token=${token}` +
    `&bbox=${bbox}` +
    `&fields=id,geometry,detections`;

  const json = await fetch(url).then(r => r.json());
  const images = json.data || [];

  const inserts = [];

  for (const img of images) {
    if (!img.geometry || !img.geometry.coordinates) continue;

    const [lon, lat] = img.geometry.coordinates;
    if (!lon || !lat) continue;

    const imageId = img.id;

    if (!img.detections || !img.detections.data) continue;

    for (const det of img.detections.data) {

      // ---- SAFE GUARD AGAINST undefined ----
      if (!det || !det.value || typeof det.value !== "string") continue;

      // Only tree detections
      if (!det.value.includes("tree")) continue;

      const detectionId = det.id;
      const uniqueId = `${imageId}-${detectionId}`;

      inserts.push(
        query(
          `INSERT INTO mapillary_tree_features
            (id, object_value, image_id, detection_id, geom, metadata)
           VALUES ($1,$2,$3,$4, ST_SetSRID(ST_Point($5,$6),4326), $7)
           ON CONFLICT (id) DO NOTHING`,
          [
            uniqueId,
            det.value,
            imageId,
            detectionId,
            lon,
            lat,
            JSON.stringify({ image: img, detection: det })
          ]
        )
      );
    }
  }

  await Promise.all(inserts);

  res.json({ imported: inserts.length });
}
