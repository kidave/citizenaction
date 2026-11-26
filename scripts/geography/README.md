# Geography GeoJSON export

Exports all non-null geometries from `public.geographies` into one validated
GeoJSON FeatureCollection. The exporter uses a keyset-paginated Supabase RPC,
so it does not build the entire dataset in one SQL response.

## GitHub Actions

The `Geography GeoJSON export` workflow runs weekly and can also be started
manually from **Actions → Geography GeoJSON export → Run workflow**.

It uses the repository's existing GitHub Actions secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The completed `citizenaction-geographies.geojson` is uploaded as a workflow
artifact for 30 days. Download the artifact from the completed workflow run
and upload the GeoJSON to MapTiler Cloud as a vector tileset.

## Database migration

Apply
`supabase/migrations/20261110110000_add_geography_geojson_export_rpc.sql`
before running the workflow. It creates a read-only, keyset-paginated RPC
restricted to the `service_role`.

## Local execution

Requires Python 3.12 and the dependencies in `requirements.txt`.

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment, then run:

```bash
python scripts/geography/export_geojson.py
```

Optional environment variables:

- `BATCH_SIZE`: 1–500; defaults to 250.
- `OUTPUT_PATH`: output file path; defaults to
  `citizenaction-geographies.geojson`.

The exporter validates each feature, rejects duplicate IDs, validates the
completed JSON, and only renames the temporary file after a successful export.
