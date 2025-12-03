// pages/api/mapillary/objects.js
import { query } from 'lib/db';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { bbox } = req.query; // expected minLon,minLat,maxLon,maxLat
    if (!bbox) return res.status(400).json({ error: 'bbox required' });

    const parts = bbox.split(',').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return res.status(400).json({ error: 'bbox must be minLon,minLat,maxLon,maxLat' });

    const [minLon, minLat, maxLon, maxLat] = parts;

    const q = `
      SELECT json_build_object(
        'type','FeatureCollection',
        'features', json_agg(
          json_build_object(
            'type','Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
              'id', id,
              'detection_id', detection_id,
              'image_id', image_id,
              'object_value', object_value,
              'confidence', properties->>'confidence'::text
            )
          )
        )
      ) as geojson
      FROM public.mapillary_detections
      WHERE geom && ST_MakeEnvelope($1,$2,$3,$4,4326)
    `;

    const r = await query(q, [minLon, minLat, maxLon, maxLat]);
    const geo = r.rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
    return res.status(200).json(geo);
  } catch (err) {
    console.error('objects api err', err);
    return res.status(500).json({ error: err.message || 'internal' });
  }
}
