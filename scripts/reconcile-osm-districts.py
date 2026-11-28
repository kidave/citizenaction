#!/usr/bin/env python3
"""Read-only reconciliation of OSM district exports against a Supabase geography snapshot.

The input snapshot is a JSON array with state_name, id, name, osm_id, source_id,
source_type, status, and optionally metadata. This tool never connects to or writes
to Supabase. It emits candidates for review; it never deactivates records.
"""
import argparse
import json
import re
from collections import defaultdict
from pathlib import Path


def load_json(path):
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", (value or "").casefold()).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--supabase-export", required=True)
    parser.add_argument("--osm-districts", required=True)
    parser.add_argument("--output", default="artifacts/osm-reconciliation")
    args = parser.parse_args()

    db_rows = load_json(args.supabase_export)
    osm_payload = load_json(args.osm_districts)
    osm_rows = osm_payload.get("results", [])
    if not isinstance(db_rows, list) or not isinstance(osm_rows, list):
        raise SystemExit("Expected Supabase export array and OSM results array")

    osm_by_id = {str(row.get("osm_id")): row for row in osm_rows if row.get("osm_id") is not None}
    osm_by_lgd = defaultdict(list)
    osm_by_name_state = defaultdict(list)
    for row in osm_rows:
        lgd = row.get("ref_lgd_district")
        if lgd:
            osm_by_lgd[str(lgd)].append(row)
        osm_by_name_state[(norm(row.get("state_name")), norm(row.get("name")))].append(row)

    matches, missing_in_supabase, historical_candidates, ambiguous = [], [], [], []
    matched_osm_ids, matched_db_ids = set(), set()
    for db in db_rows:
        db_id = str(db.get("osm_id") or db.get("source_id") or "")
        state = norm(db.get("state_name"))
        name_key = (state, norm(db.get("name")))
        match = osm_by_id.get(str(db.get("osm_id"))) if db.get("osm_id") is not None else None
        match_type = "osm_id"
        if match is None and db.get("source_type") == "relation" and db.get("source_id"):
            match = osm_by_id.get(str(db["source_id"]))
            match_type = "source_id"
        if match:
            matches.append({"supabase_id": db.get("id"), "supabase_name": db.get("name"),
                            "state_name": db.get("state_name"), "osm_id": str(match["osm_id"]),
                            "match_type": match_type, "osm_name": match.get("name"),
                            "status": db.get("status")})
            matched_osm_ids.add(str(match["osm_id"]))
            matched_db_ids.add(str(db.get("id")))
            continue
        candidates = osm_by_name_state.get(name_key, [])
        if len(candidates) == 1:
            historical_candidates.append({
                "supabase_id": db.get("id"), "state_name": db.get("state_name"),
                "supabase_name": db.get("name"), "old_osm_id": db.get("osm_id"),
                "source_id": db.get("source_id"),
                "possible_replacement_osm_id": str(candidates[0]["osm_id"]),
                "reason": "same normalized state and district name; requires boundary/LGD verification",
                "recommended_action": "review_before_inactivation"})
        elif len(candidates) > 1:
            ambiguous.append({"supabase_id": db.get("id"), "state_name": db.get("state_name"),
                              "name": db.get("name"),
                              "candidate_osm_ids": [str(row["osm_id"]) for row in candidates]})
    for osm_id, row in osm_by_id.items():
        if osm_id not in matched_osm_ids:
            missing_in_supabase.append({"osm_id": osm_id, "state_name": row.get("state_name"),
                                        "name": row.get("name"),
                                        "lgd_district": row.get("ref_lgd_district"),
                                        "action": "insert_candidate"})

    report = {
        "mode": "read_only_reconciliation",
        "supabase_records": len(db_rows), "osm_relations": len(osm_rows),
        "exact_matches": len(matches), "insert_candidates": len(missing_in_supabase),
        "possible_historical_records": len(historical_candidates),
        "ambiguous_records": len(ambiguous),
        "matches": matches, "insert_candidates": missing_in_supabase,
        "historical_candidates": historical_candidates, "ambiguous": ambiguous,
        "safety": "No records are modified. Inactivation requires verified replacement and explicit approval."
    }
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    (out / "reconciliation-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in (
        "supabase_records", "osm_relations", "exact_matches", "insert_candidates",
        "possible_historical_records", "ambiguous_records")}, indent=2))


if __name__ == "__main__":
    main()
