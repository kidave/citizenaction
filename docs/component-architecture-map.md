# Component Architecture Map

## Online explorer

The Next.js page at `/engineering/architecture` generates a searchable architecture explorer at build time. The companion `/engineering/components` page is a component catalogue with origin classification, detected props and CVA variants/defaults, local component dependencies, and JSX usage locations. It shows each source module, its static local imports, reverse consumers, literal backend references, and likely Storybook matches. Selecting a module lets you navigate both directions through its dependency relationships.

The page is a static source-analysis snapshot generated during the Next.js build. It is not a live runtime trace. It has `noindex` metadata because it is an engineering tool; it does not require production Supabase credentials and does not read or write the database.

## Why this uses dependency-cruiser instead of ReactGraph

ReactGraph was evaluated against Citizen Action. Its first CI run completed but emitted zero pages, one component and zero edges. Reviewing its current analyzer source showed it scans `.ts` and `.tsx` files, while Citizen Action uses JavaScript/JSX under `src/pages` and `src/components`. Its output was therefore not a reliable map for this repository.

The CI workflow uses dependency-cruiser for the richer module graph. The online page also has a small build-time source scanner so the relationship explorer can be rendered as part of the app rather than requiring users to download a workflow artifact. These two views complement each other: the page is navigable and feature-oriented; the workflow artifact contains dependency-cruiser's complete JSON/DOT/SVG output.

## Generated workflow outputs

- `dependency-graph.json`: module relationships and analysis summary from dependency-cruiser.
- `module-architecture.dot` and `module-architecture.svg`: Graphviz module graph.
- `supabase-usage.json` and `supabase-usage.csv`: literal source references to backend objects and API routes.

GitHub Actions uploads these as a `component-architecture-map-*` artifact for 30 days. The workflow does not deploy the app or write to Supabase.

## How to read the relationships

- **Imports / depends on:** module A imports module B.
- **Used by / consumers:** modules that statically import the selected module.
- **Backend references:** literal names found in source, with line numbers.
- **Storybook matches:** probable story files matched by component/file base name.\n- **Component catalogue:** heuristic shadcn-based/custom classification, variants/defaults from class-variance-authority maps, prop names detected from source, and JSX usages found through recognized static imports.

Static analysis cannot prove that a component renders at runtime. Dynamic imports, re-export barrels, registries, and dynamically assembled backend names may be missed. Backend references do not prove that an object exists in the live Supabase schema. Storybook is still the visual reference for component states. The catalogue does not claim that a locally copied shadcn component is byte-for-byte upstream; its origin classification is heuristic. Prop and JSX usage extraction can miss complex types, spreads, aliases, dynamic imports, and registry-driven rendering.

## Local workflow

```bash
mkdir -p artifacts/component-map
npx --yes dependency-cruiser@18.7.0 --output-type json --output-to artifacts/component-map/dependency-graph.json src
npx --yes dependency-cruiser@18.7.0 --output-type ddot --output-to artifacts/component-map/module-architecture.dot src
dot -Tsvg artifacts/component-map/module-architecture.dot -o artifacts/component-map/module-architecture.svg
node scripts/component-map/scan-supabase-usage.mjs
```

## Security

The explorer is source-derived and marks itself `noindex`, but anyone who can reach the route may inspect file paths and static backend object names. It never exposes environment variables or credentials. Keep secrets out of source and never put a Supabase service-role key in client code.
