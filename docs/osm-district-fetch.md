# OSM district incremental sync

This read-only workflow discovers India's OSM state/UT relations (admin_level=4)
and district relations (admin_level=5) through the existing public Overpass
endpoints. It compares relation metadata with the latest completed workflow
artifact and downloads geometry only for new or changed relations.

It does not write to Supabase or modify `public.geographies`.

## Run

1. Open **Actions → Fetch OSM Districts and Boundaries → Run workflow**.
2. Select the branch containing this workflow.
3. Set `state` to `all` or an exact OSM state/UT name.
4. Keep the default geometry batch size unless Overpass is timing out.
5. Download the `osm-district-sync-*` artifact for review.

The workflow restores the latest completed **main-branch** run's artifact as its
baseline (including the original full-fetch artifact). It validates that the
dataset files exist and fails closed rather than silently treating a malformed
baseline as empty. A subsequent run reuses the restored dataset. Geometry is
checkpointed into the consolidated output after every batch, so a failed run's
uploaded artifact can resume from already completed geometry.

## Incremental comparison

For each selected state, the fetcher runs both Overpass area-resolution
strategies:

- Derived area ID: `3600000000 + state relation ID`.
- Explicit conversion: fetch the state relation and use `map_to_area`.

The results are unioned and deduplicated by OSM relation ID. The fetcher
compares each relation's OSM `version` and `timestamp` with the baseline:

- New relation: fetch and add its geometry.
- Changed relation: refresh its geometry and metadata.
- Unchanged relation: retain its existing geometry without another geometry request.
- Missing from the latest discovery: flag as a removal candidate; retain it
  until reviewed rather than deleting it automatically.
- Failed or missing geometry: preserve an existing boundary when available and
  report the failure for review.

The initial run has no baseline and fetches geometry for all discovered
relations. Because the existing full-export artifact does not include OSM
version metadata on its features, the first incremental run against that legacy
artifact will also refresh those boundaries once to establish versioned
geometry. Subsequent runs fetch geometry only for additions, updates, or any
relation whose geometry version is missing or stale.
When the user selects one state, other states in the baseline are retained in
the consolidated export.

## Completeness and review

The two discovery strategies are both required for a state to be considered
complete. Their relation-ID discrepancies, request errors, missing geometry,
and failed batches are recorded in `fetch-report.json`. The workflow exits
non-zero when these issues are present, but preserves the exported data and
the last known geometry for review.

The workflow artifact is the cross-run resume mechanism; the runner's local
filesystem is not treated as persistent storage. The latest completed
main-branch workflow artifact is used as the next baseline. Artifacts are
retained for 30 days. A state with failed discovery or strategy disagreement
does not generate removal candidates.

## Artifact contents

- `fetch-report.json`: baseline size, per-state new/updated/unchanged counts,
  removed candidates, query discrepancies, and geometry failures.
- `india-osm-districts.json`: consolidated relation metadata including OSM
  version, timestamp, and changeset.
- `india-osm-district-centres.geojson`: district centre points.
- `india-osm-district-boundaries.geojson`: relation member ways as GeoJSON
  `MultiLineString` features, matching the existing app fallback.
- `raw/india-states-index.json` and `raw/<state>-<strategy>.json`: raw
  Overpass responses for auditing.

The exporter deliberately does not invent polygon rings or claim the linework
is polygon topology.

## Import policy

This workflow is strictly read-only. It has no Supabase credentials and does
not call database RPCs or write to `public.geographies`. Review OSM relation
coverage and reconcile LGD codes separately before any import.

## Supabase reconciliation and historical districts

The OSM workflow itself remains read-only and does not need Supabase credentials.
To compare the OSM export with existing geography records:

1. Run `scripts/export-district-snapshot.sql` in the Supabase SQL editor.
2. Save the returned JSON array as `supabase-districts.json`.
3. Run:

```bash
python scripts/reconcile-osm-districts.py \
  --supabase-export supabase-districts.json \
  --osm-districts artifacts/osm-districts/india-osm-districts.json \
  --output artifacts/osm-reconciliation
```

The report matches exact `osm_id` first, then OSM relation `source_id`.
Same-state normalized district names are only candidate evidence; they are
never sufficient to merge or deactivate records. The report identifies new
OSM insert candidates, possible historical/replaced records, and ambiguous
matches. LGD references from OSM are included for manual cross-checking.

**Inactivation policy:** preserve old geography UUIDs, geometries and references.
Only mark an older district `inactive` after a replacement is verified using
OSM identity plus LGD and/or boundary evidence. Never deactivate records merely
because they are absent from an incomplete discovery result. No automatic
Supabase updates are performed by these scripts.
