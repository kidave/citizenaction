# OSM district and boundary fetch

This read-only workflow discovers India's OSM state/UT relations (admin_level=4),
then discovers district relations (admin_level=5) within each state using public
Overpass API instances. It exports relation-member boundary linework for review.
It does not write to Supabase or modify `public.geographies`.

## Run

1. Open **Actions → Fetch OSM Districts and Boundaries → Run workflow**.
2. Select this feature branch.
3. Set `state` to `all` or an exact OSM state/UT name, such as `Maharashtra`.
4. Keep the default geometry batch size (10) unless an Overpass instance is
   returning timeouts; smaller batches reduce per-request load.
5. Download the workflow artifact after completion, including when a run fails.

The workflow must first exist on the repository's default branch to appear in
GitHub Actions as a manually dispatchable workflow. Until then, run it from this
branch using the workflow page/branch selector if GitHub exposes it, or merge
only after review.

## District discovery and completeness

For every state relation, the fetcher runs both independent Overpass area
resolution strategies:

- Derived area ID: `3600000000 + state relation ID`.
- Explicit conversion: fetch the state relation and use `map_to_area`.

The results are unioned and deduplicated by OSM relation ID. The fetcher does
not stop after the first non-empty response. It records each strategy's count,
relation IDs, raw response, endpoint diagnostics, and any discrepancy between
the two sets. Empty responses are not silently interpreted as a complete
state result. Relations without a usable name are retained in the raw/normalized
dataset and listed separately for review.

A state is marked complete only when both query strategies completed without
request errors. A discrepancy between the strategies makes the workflow exit
non-zero even though the union is preserved for inspection. This deliberately
prevents a partial but valid Overpass response from being treated as verified
coverage.

## Boundary geometry

After district discovery, unique relation IDs are fetched in bounded batches
using Overpass relation geometry output (`rel(id); out body geom;`). The
exporter preserves the member-way coordinates as GeoJSON `MultiLineString`,
matching the existing app fallback's line-based boundary representation. It
does not attempt to invent polygon rings or claim that the output is Polygon
geometry.

Missing relation geometry and failed batches are reported. A workflow is not
green if a state is incomplete, the two discovery strategies disagree, or
boundary geometry is missing/failed. Re-run the affected state or inspect the
raw responses before considering the dataset ready for import.

## Artifact contents

- `fetch-report.json`: state coverage, query discrepancies, unnamed relations,
  geometry success/failure counts, and failed batches.
- `india-osm-districts.json`: deduplicated district relation metadata.
- `india-osm-district-centres.geojson`: district centre points for GIS review.
- `india-osm-district-boundaries.geojson`: OSM relation member ways as
  `MultiLineString` features.
- `raw/india-states-index.json`: raw India state/UT relation index.
- `raw/<state>-<strategy>.json`: raw per-state Overpass responses for both
  district discovery strategies.

## Import policy

This workflow is strictly read-only. It has no Supabase credentials and does
not call database RPCs or write to `public.geographies`. Review the relation
IDs and boundary output first; reconcile LGD codes as a separate later step.
