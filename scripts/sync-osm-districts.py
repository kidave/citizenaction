#!/usr/bin/env python3
"""Incremental, resumable OSM district sync. Overpass only; no database writes."""
import argparse
import importlib.util
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("osm_full_fetch", HERE / "fetch-osm-districts.py")
osm = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(osm)


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def find_dataset_root(path):
    """Accept either a dataset directory or gh run download's artifact subdirectory."""
    candidates = [path] + [p for p in path.rglob("*") if p.is_dir()]
    for candidate in candidates:
        if (candidate / "india-osm-districts.json").is_file() and (candidate / "india-osm-district-boundaries.geojson").is_file():
            return candidate
    raise RuntimeError(f"No complete OSM baseline dataset found under {path}")

def load_baseline(path):
    root = find_dataset_root(path)
    records = read_json(root / "india-osm-districts.json", {}).get("results", [])
    boundaries = read_json(root / "india-osm-district-boundaries.geojson", {}).get("features", [])
    if not records or not boundaries:
        raise RuntimeError(f"Baseline at {root} is empty or incomplete; refusing to start a full refetch")
    return ({str(row["osm_id"]): row for row in records if row.get("osm_id")},
            {str(feature.get("properties", {}).get("osm_id")): feature
             for feature in boundaries if feature.get("properties", {}).get("osm_id")})


def versioned_record(record, raw_elements):
    element = raw_elements.get(record["osm_id"], {})
    record["osm_version"] = element.get("version")
    record["osm_timestamp"] = element.get("timestamp")
    record["osm_changeset"] = element.get("changeset")
    return record


def discover_state(state, attempts, delay, raw_dir):
    results, errors = {}, []
    for strategy, original_query in osm.district_queries(state):
        query = original_query.replace("out tags center;", "out meta center;")
        try:
            payload, request = osm.overpass(query, attempts, delay)
            raw_by_id = {str(e.get("id")): e for e in payload["elements"]
                         if e.get("type") == "relation"}
            rows = [versioned_record(row, raw_by_id)
                    for e in payload["elements"]
                    if (row := osm.normalize(e, state)) is not None]
            results[strategy] = rows
            osm.save_json(raw_dir / (osm.slug(state["name"]) + "-" + strategy + ".json"),
                          {"state": state, "strategy": strategy, "query": query,
                           "request": request, "response": payload})
        except Exception as exc:
            errors.append({"strategy": strategy, "error": str(exc)})
    merged = {}
    for rows in results.values():
        for row in rows:
            merged[row["osm_id"]] = row
    id_sets = [set(row["osm_id"] for row in rows) for rows in results.values()]
    discrepancy = sorted(set.union(*id_sets) - set.intersection(*id_sets), key=int) if len(id_sets) > 1 else []
    return merged, results, errors, discrepancy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", default="all")
    parser.add_argument("--attempts", type=int, default=2)
    parser.add_argument("--delay-seconds", type=float, default=3)
    parser.add_argument("--geometry-batch-size", type=int, default=10)
    parser.add_argument("--baseline-dir", default="")
    parser.add_argument("--output-dir", default="artifacts/osm-districts")
    args = parser.parse_args()
    if not 1 <= args.attempts <= 4 or not 1 <= args.geometry_batch_size <= 25:
        parser.error("attempts must be 1-4 and geometry batch size 1-25")
    out, raw = Path(args.output_dir), Path(args.output_dir) / "raw"
    baseline, boundary_by_id = load_baseline(Path(args.baseline_dir)) if args.baseline_dir else ({}, {})
    current = dict(baseline)
    state_data, _ = osm.overpass(osm.STATE_QUERY, args.attempts, args.delay_seconds, True)
    osm.save_json(raw / "india-states-index.json", {"query": osm.STATE_QUERY, "response": state_data})
    states = []
    for item in state_data["elements"]:
        tags = item.get("tags") or {}
        name = tags.get("name") or tags.get("name:en") or tags.get("official_name")
        if item.get("type") == "relation" and str(tags.get("admin_level")) == "4" and name:
            states.append({"name": name, "osm_id": int(item["id"]), "tags": tags})
    states.sort(key=lambda row: row["name"].casefold())
    if args.state.casefold() != "all":
        states = [row for row in states if row["name"].casefold() == args.state.casefold()]
        if not states:
            raise SystemExit("State/UT not found: " + args.state)

    report = {"source": "OpenStreetMap via Overpass", "mode": "incremental",
              "baseline_relations": len(baseline), "states": [], "query_discrepancies": [],
              "failed_states": [], "new_relations": [], "updated_relations": [],
              "unchanged_relations": [], "removed_candidates": [], "geometry": {
                  "fetched": 0, "failed": [], "missing": []}}
    selected_state_ids = {str(row["osm_id"]) for row in states}
    state_to_ids = {}
    for old_id, row in current.items():
        if str(row.get("state_osm_id")) in selected_state_ids:
            state_to_ids.setdefault(str(row.get("state_osm_id")), set()).add(old_id)

    for index, state in enumerate(states, 1):
        print(f"[{index}/{len(states)}] {state['name']}: discover and compare", flush=True)
        found, strategies, errors, discrepancy = discover_state(
            state, args.attempts, args.delay_seconds, raw)
        if discrepancy:
            report["query_discrepancies"].append({"state": state["name"], "relation_ids": discrepancy})
        if errors or len(strategies) != 2 or not found:
            report["failed_states"].append({"state": state["name"], "errors": errors,
                                             "strategy_count": len(strategies)})
        previous_ids = state_to_ids.get(str(state["osm_id"]), set())
        new_ids, changed_ids, unchanged_ids = [], [], []
        for osm_id, row in found.items():
            old = baseline.get(osm_id)
            if old is None:
                new_ids.append(osm_id)
            elif (old.get("osm_version") != row.get("osm_version") or
                  old.get("osm_timestamp") != row.get("osm_timestamp")):
                changed_ids.append(osm_id)
            else:
                unchanged_ids.append(osm_id)
            current[osm_id] = row
        report["new_relations"].extend(new_ids)
        report["updated_relations"].extend(changed_ids)
        report["unchanged_relations"].extend(unchanged_ids)
        # A removal candidate is meaningful only when both strategies succeeded and agree.
        # Partial discovery must never turn valid existing records into apparent removals.
        discovery_verified = len(strategies) == 2 and not errors and not discrepancy
        if discovery_verified:
            report["removed_candidates"].extend(sorted(previous_ids - set(found), key=int))

        needs_geometry = [
            row for key, row in found.items()
            if (key not in boundary_by_id or
                boundary_by_id[key].get("properties", {}).get("osm_version") != row.get("osm_version"))
        ]
        if needs_geometry:
            temp = out / "_geometry" / osm.slug(state["name"])
            temp.mkdir(parents=True, exist_ok=True)
            geom_report = osm.fetch_boundaries(needs_geometry, temp, args.attempts,
                                               args.delay_seconds, args.geometry_batch_size)
            new_features = read_json(temp / "india-osm-district-boundaries.geojson", {}).get("features", [])
            versions = {str(row["osm_id"]): row for row in needs_geometry}
            for feature in new_features:
                key = str(feature.get("properties", {}).get("osm_id"))
                if key in versions:
                    feature.setdefault("properties", {})["osm_version"] = versions[key].get("osm_version")
                    feature["properties"]["osm_timestamp"] = versions[key].get("osm_timestamp")
                    feature["properties"]["osm_changeset"] = versions[key].get("osm_changeset")
                    boundary_by_id[key] = feature
            report["geometry"]["fetched"] += geom_report["fetched_relations"]
            report["geometry"]["failed"].extend(geom_report["failed_batches"])
            report["geometry"]["missing"].extend(geom_report["missing_geometry"])
            for key in geom_report["missing_geometry"]:
                if key not in boundary_by_id:
                    report["geometry"]["missing"].append(key)

        report["states"].append({"name": state["name"], "osm_id": str(state["osm_id"]),
                                 "discovered": len(found), "new": len(new_ids),
                                 "updated": len(changed_ids), "unchanged": len(unchanged_ids),
                                 "discrepancy_count": len(discrepancy), "errors": errors})
        # Write a complete checkpoint after each state. Workflow artifact upload preserves it on failure/cancel.
        write_outputs(out, current, boundary_by_id, report)
    # Keep baseline records for unselected states; never silently delete OSM relations.
    report["district_count"] = len(current)
    report["boundary_count"] = len(boundary_by_id)
    write_outputs(out, current, boundary_by_id, report)
    return 1 if report["failed_states"] or report["query_discrepancies"] or report["geometry"]["failed"] or report["geometry"]["missing"] else 0


def write_outputs(out, records, boundaries, report):
    out.mkdir(parents=True, exist_ok=True)
    ordered = sorted(records.values(), key=lambda row: ((row.get("name") or "").casefold(), int(row["osm_id"])))
    write_json(out / "india-osm-districts.json", {"count": len(ordered), "results": ordered})
    write_json(out / "india-osm-district-boundaries.geojson",
               {"type": "FeatureCollection", "name": "India OSM district boundaries",
                "features": sorted(boundaries.values(), key=lambda f: int(f.get("properties", {}).get("osm_id", 0)))})
    centres = []
    for row in ordered:
        centre = row.get("center")
        if centre and centre.get("lon") is not None and centre.get("lat") is not None:
            props = {k: v for k, v in row.items() if k != "center"}
            centres.append({"type": "Feature", "id": "relation/" + row["osm_id"],
                            "geometry": {"type": "Point", "coordinates": [centre["lon"], centre["lat"]]},
                            "properties": props})
    write_json(out / "india-osm-district-centres.geojson",
               {"type": "FeatureCollection", "name": "India OSM district centres", "features": centres})
    write_json(out / "fetch-report.json", report)


if __name__ == "__main__":
    raise SystemExit(main())
