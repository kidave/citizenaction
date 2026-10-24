# Component Architecture Map

## Why this uses dependency-cruiser instead of ReactGraph

ReactGraph was evaluated against the current `main` source. Its first CI run completed but emitted zero pages, one component and zero edges. Reviewing its current analyzer source shows it scans `.ts` and `.tsx` files, while Citizen Action uses JavaScript/JSX under `src/pages` and `src/components`. The output was therefore not a reliable map for this repository. It is not used as the authoritative analyzer in this workflow.

The workflow uses dependency-cruiser, which supports JavaScript modules and reads the existing `.dependency-cruiser.js` configuration. This captures static module imports, not every runtime render relationship.

## Generated outputs

- `dependency-graph.json`: module relationships and analysis summary from dependency-cruiser.
- `module-architecture.dot`: grouped Graphviz graph of module architecture.
- `module-architecture.svg`: openable visual architecture graph.
- `supabase-usage.json`: literal source references to Supabase tables/views, storage buckets, RPC names, Edge Functions and `/api/*` fetch paths.
- `supabase-usage.csv`: spreadsheet-friendly backend-reference report with source path and line number.

GitHub Actions uploads these outputs as a `component-architecture-map-*` workflow artifact for 30 days. This workflow does not deploy the app or write to Supabase.

## Local usage

From the repository root:

```bash
mkdir -p artifacts/component-map
npx --yes dependency-cruiser@18.7.0 --output-type json --output-to artifacts/component-map/dependency-graph.json src
npx --yes dependency-cruiser@18.7.0 --output-type ddot --output-to artifacts/component-map/module-architecture.dot src
dot -Tsvg artifacts/component-map/module-architecture.dot -o artifacts/component-map/module-architecture.svg
node scripts/component-map/scan-supabase-usage.mjs
```

Open `module-architecture.svg` in a browser or image viewer. Use the JSON report for detailed module edges and the CSV to see exactly which source files contain backend references.

## Limitations and scope

- Static module imports approximate component relationships but do not prove a component renders at runtime; dynamic imports and indirect registries may be missed.
- `supabase-usage.json` captures literal names only. Dynamic names, wrapped clients, SQL assembled indirectly and runtime-only relationships can be missed.
- Backend references are currently provided as a source-file-to-object list rather than one merged UI graph. A table/RPC reference does not prove that the object exists in live Supabase.
- Validating backend object names against live Supabase requires a separate read-only schema snapshot with credentials in GitHub Actions Secrets, or comparison against committed migrations. Never expose service-role credentials to the browser or commit secrets.
- Storybook remains the source of visual examples and component states. Dependency analysis does not replace Storybook tests or visual review.
