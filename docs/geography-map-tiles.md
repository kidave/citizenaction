# Geography vector tiles

The public geography browser uses the MapTiler vector tileset as its boundary rendering source and the `geographies` table as the canonical hierarchy and selection source.

## Configuration

Set `NEXT_PUBLIC_MAPTILER_API_KEY` in Vercel Preview for the geography feature branch. The key is a browser-visible, read-only MapTiler key. Restrict it in MapTiler Cloud to the CitizenAction preview and production hostnames before enabling it in production.

## Tileset contract

Tileset: `01a1c410-4845-77a6-bb9d-68585341ace3`

The map reads the TileJSON metadata to identify the vector source-layer. The source-layer must expose the exported properties `id`, `parent_id`, `boundary_category`, `geography_type`, and `status`.

## Hierarchy filtering

The map displays the selected feature plus its direct children. The child filter is based on `parent_id`, `boundary_category`, and active `status`. The parent feature is intentionally not constrained by category, because a political child can belong to an administrative parent (for example, a parliamentary constituency whose parent is a state).

Expected navigation:

- India → administrative states
- State → administrative districts
- State → political parliamentary constituencies
- District → administrative sub-districts
- Parliamentary constituency → political assembly constituencies
- Local government → zones → wards

Changing the category preserves a selected state or other valid cross-category parent so the political children of an administrative state remain discoverable.

The tileset is not destructively filtered or split by category. The client applies view filters dynamically, keeping one canonical vector tileset.
