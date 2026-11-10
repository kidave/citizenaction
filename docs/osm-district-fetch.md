# OSM district fetch

The **Fetch OSM Districts** GitHub Actions workflow retrieves Indian state/UT
relations (admin_level=4) and their district relations (admin_level=5) from
public Overpass instances.

## Run

1. Open **Actions → Fetch OSM Districts → Run workflow**.
2. Select the feature branch containing this workflow.
3. Set `state` to `all` or an exact state/UT name, such as `Maharashtra`.
4. Download the generated workflow artifact after the run.

The workflow runs sequentially to avoid unnecessary load on public Overpass
instances. It rotates through endpoints, retries with backoff, preserves each
state's raw response, and continues after individual state failures so
successful results are not lost.

## Artifact contents

- `fetch-report.json`: per-state success/failure summary and counts.
- `india-osm-districts.json`: normalized district relation records.
- `india-osm-district-centres.geojson`: district centre points for GIS review.
- `raw/india-states-index.json`: raw state/UT relation index response.
- `raw/<state>.json`: raw district response and query for each processed state.

The current query uses `out tags center;`. It retrieves tags and centre points,
not complete district boundary geometries. The GeoJSON is not a boundary dataset.

## Safety

This workflow is read-only. It requires no Supabase credentials and does not
write to `public.geographies`. Reconcile the artifact against the LGD master
and review it before preparing a separate database import.
