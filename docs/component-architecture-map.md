# Component Architecture Map

## Purpose

Generate a source-derived relationship map when code is pushed or a pull request targets `main`. The map is a development artifact, not runtime application data.

## Generated outputs

- `reactgraph.json`: ReactGraph's static graph of detected pages, components, hooks, APIs and import edges.
- `artifacts/component-map/supabase-usage.json`: literal source references to Supabase tables/views, storage buckets, RPC names, Edge Functions and `/api/*` fetch paths.
- `artifacts/component-map/supabase-usage.csv`: spreadsheet-friendly backend-reference report.

GitHub Actions uploads these outputs as a `component-architecture-map-*` workflow artifact for 30 days. This workflow does not deploy the app or write to Supabase.

## Local usage

From the repository root:

```bash
npx --yes --package=@reactgraph-ui/core@0.1.9 reactgraph analyze .
node scripts/component-map/scan-supabase-usage.mjs
npx --yes --package=@reactgraph-ui/core@0.1.9 reactgraph serve .
```

Re-run the analyzer after code changes. ReactGraph's published documentation currently lists real-time file-save updates as planned functionality.

## Limitations

- The source scanner captures literal names only. Dynamic names, wrapped Supabase clients, SQL assembled indirectly and runtime-only relationships can be missed.
- This first version produces related artifacts but does not claim to merge backend references into ReactGraph graph nodes.
- A source reference does not prove the query executes or that the live database object exists.
- Validating against the live schema requires a separate read-only schema snapshot with credentials in GitHub Actions Secrets, or comparison against committed migrations. Never expose service-role credentials to the browser or commit secrets.
- Storybook remains the source of visual examples and component states. Static dependency analysis does not replace Storybook tests or visual review.
