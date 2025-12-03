// lib/mapillary.js
import { Buffer } from 'buffer';
import Pbf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';

/**
 * Basic Graph API fetch wrapper (server-side)
 */
export async function graphFetch(path, fields = [], params = {}) {
  const token = process.env.MAPILLARY_TOKEN;
  if (!token) throw new Error('Missing MAPILLARY_TOKEN env var');

  // Build URL
  const url = new URL(`https://graph.mapillary.com/${path}`);
  if (fields && fields.length) url.searchParams.set('fields', fields.join(','));

  // append params
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  // token as query param is acceptable for server-side client token
  url.searchParams.set('access_token', token);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`Mapillary Graph API error: ${res.status} ${txt}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Decode Mapillary detection geometry (base64 vector-tile payload)
 * Returns an array of GeoJSON-like polygons in pixel coordinates (image space),
 * normalized to image width/height.
 *
 * Mapillary encodes detection geometry as a small vector-tile payload.
 * We decode it using @mapbox/vector-tile + pbf and then normalize by extent.
 *
 * @param {string} base64String - geometry field from Mapillary detection
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @returns {Array} polygons as arrays of [ [x,y], [x,y], ... ] in pixel coords
 */
export function decodeDetectionGeometry(base64String, imageWidth = 0, imageHeight = 0) {
  try {
    const raw = Buffer.from(base64String, 'base64');
    const tile = new VectorTile(new Pbf(raw));

    // Mapillary uses a custom layer name like 'mpy-or' or similar; find first layer
    const layerNames = Object.keys(tile);
    if (!layerNames.length) return [];

    const layer = tile[layerNames[0]]; // e.g. 'mpy-or'
    const extent = layer.extent || 4096; // fallback to 4096

    const features = [];
    for (let i = 0; i < layer.length; i++) {
      const feat = layer.feature(i);
      const geom = feat.loadGeometry(); // array of rings; each point as {x, y}
      // Convert to polygons (one or multiple)
      geom.forEach((ring) => {
        const coords = ring.map((pt) => {
          // normalize to [0..1] then to pixel coords
          const nx = (pt.x) / extent;
          const ny = (pt.y) / extent;
          const px = Math.round(nx * imageWidth);
          const py = Math.round(ny * imageHeight);
          return [px, py];
        });
        // push polygon ring
        features.push(coords);
      });
    }
    return features; // array of polygon rings in pixel coords
  } catch (err) {
    console.warn('decodeDetectionGeometry failed', err?.message || err);
    return [];
  }
}

/**
 * Convert image-space pixel polygon to approximate world coordinates (lon/lat),
 * by using image computed_geometry (lon,lat) and simple offset using small-angle approximations.
 *
 * NOTE: This is an approximation. For more accurate georeferencing use camera intrinsics + depth.
 *
 * @param {[number,number][]} pixelRing  - array of [x,y] in pixel coords
 * @param {object} imageMeta - object containing computed_geometry {coordinates: [lon,lat]}, width, height
 * @returns {Array} geo ring [ [lon, lat], ... ]
 */
export function pixelRingToLatLon(pixelRing, imageMeta = {}) {
  // Basic fallback: map pixel coords to a small bbox around image location.
  // This is approximate. Ideally use camera intrinsics + depth to project pixels to geo coords.
  const width = imageMeta.width || imageMeta.w || 1024;
  const height = imageMeta.height || imageMeta.h || 768;
  const [lon0, lat0] = (imageMeta.computed_geometry?.coordinates || imageMeta.geometry?.coordinates || [0, 0]);

  // Choose a small buffer distance in meters to cover image footprint (approx)
  // Many Mapillary images view ~20-50m; we'll use 30m half-extent as default
  const metersHalf = 30;
  const metersPerDegLat = 111320; // approx
  const metersPerDegLon = Math.cos(lat0 * Math.PI / 180) * metersPerDegLat;

  const lonMin = lon0 - (metersHalf / metersPerDegLon);
  const lonMax = lon0 + (metersHalf / metersPerDegLon);
  const latMin = lat0 - (metersHalf / metersPerDegLat);
  const latMax = lat0 + (metersHalf / metersPerDegLat);

  const geo = pixelRing.map(([px, py]) => {
    const nx = px / width;
    const ny = py / height;
    const lon = lonMin + nx * (lonMax - lonMin);
    const lat = latMax - ny * (latMax - latMin); // y=0 top -> latMax
    return [lon, lat];
  });
  return geo;
}
