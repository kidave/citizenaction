#!/usr/bin/env python3
"""Read-only India OSM district discovery and boundary export via Overpass."""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ENDPOINTS = [
    ("overpass.private.coffee", "https://overpass.private.coffee/api/interpreter", 90),
    ("maps.mail.ru", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", 75),
    ("overpass-api.de", "https://overpass-api.de/api/interpreter", 60),
]
USER_AGENT = "CitizenAction-OSM-District-Ingestion/2.0 (https://github.com/kidave/citizenaction)"
STATE_QUERY = """[out:json][timeout:90];
area["ISO3166-1"="IN"]["boundary"="administrative"]->.india;
rel["boundary"="administrative"]["admin_level"="4"](area.india);
out tags center;"""


def now():
    return datetime.now(timezone.utc).isoformat()


def slug(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "unknown"


def save_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def overpass(query, attempts, delay, require_nonempty=False):
    diagnostics = []
    for attempt in range(1, attempts + 1):
        rotated = ENDPOINTS[attempt - 1:] + ENDPOINTS[:attempt - 1]
        for name, url, timeout in rotated:
            started = time.monotonic()
            request = urllib.request.Request(
                url,
                data=urllib.parse.urlencode({"data": query}).encode(),
                headers={"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                         "Accept": "application/json", "User-Agent": USER_AGENT},
                method="POST",
            )
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                    if not isinstance(payload, dict) or not isinstance(payload.get("elements"), list):
                        raise ValueError("Response does not contain an elements array")
                    if payload.get("remark"):
                        raise ValueError("Incomplete Overpass response: " + str(payload["remark"]))
                    if require_nonempty and not payload["elements"]:
                        raise ValueError("Overpass returned a valid but empty elements array")
                    diagnostics.append({"endpoint": name, "attempt": attempt, "outcome": "success",
                                        "http_status": response.status,
                                        "elapsed_seconds": round(time.monotonic() - started, 2)})
                    return payload, {"endpoint": name, "attempts": diagnostics}
            except urllib.error.HTTPError as error:
                diagnostics.append({"endpoint": name, "attempt": attempt, "outcome": "http_error",
                                    "http_status": error.code,
                                    "elapsed_seconds": round(time.monotonic() - started, 2),
                                    "message": error.read(500).decode("utf-8", errors="replace")})
            except Exception as error:
                diagnostics.append({"endpoint": name, "attempt": attempt, "outcome": "error",
                                    "elapsed_seconds": round(time.monotonic() - started, 2),
                                    "message": str(error)[:500]})
        if attempt < attempts:
            wait = delay * (2 ** (attempt - 1))
            print(f"All endpoints failed on attempt {attempt}; retrying in {wait:g}s.", flush=True)
            time.sleep(wait)
    raise RuntimeError(json.dumps({"message": "All Overpass endpoints failed", "diagnostics": diagnostics}))


def district_queries(state):
    """Run both area-resolution strategies; do not treat one valid response as exhaustive."""
    area_id = 3_600_000_000 + state["osm_id"]
    primary = f"""[out:json][timeout:90];
area(id:{area_id})->.stateArea;
rel["type"="boundary"]["boundary"="administrative"]["admin_level"="5"](area.stateArea);
out tags center;"""
    fallback = f"""[out:json][timeout:90];
rel({state["osm_id"]})->.stateRelation;
.stateRelation map_to_area -> .stateArea;
rel["type"="boundary"]["boundary"="administrative"]["admin_level"="5"](area.stateArea);
out tags center;"""
    return [("relation_area", primary), ("map_to_area", fallback)]


def normalize(element, state):
    tags = element.get("tags") or {}
    if element.get("type") != "relation" or not element.get("id") or str(tags.get("admin_level")) != "5":
        return None
    name = tags.get("name") or tags.get("name:en") or tags.get("official_name")
    center = element.get("center") or {}
    lat, lon = center.get("lat"), center.get("lon")
    return {
        "osm_type": "relation", "osm_id": str(element["id"]), "name": name,
        "official_name": tags.get("official_name"), "admin_level": 5,
        "boundary": tags.get("boundary"), "ref": tags.get("ref"),
        "ref_lgd_district": tags.get("ref:LGD:district"), "wikidata": tags.get("wikidata"),
        "state_name": state["name"], "state_osm_id": str(state["osm_id"]),
        "center": {"lat": lat, "lon": lon} if lat is not None and lon is not None else None,
        "source_url": f"https://www.openstreetmap.org/relation/{element['id']}",
        "has_name": bool(name),
    }


def relation_lines(element):
    """Match the app's established OSM fallback: preserve relation member ways as lines."""
    lines = []
    for member in element.get("members") or []:
        if member.get("type") != "way":
            continue
        coordinates = []
        for point in member.get("geometry") or []:
            try:
                lon, lat = float(point["lon"]), float(point["lat"])
            except (KeyError, TypeError, ValueError):
                continue
            if -180 <= lon <= 180 and -90 <= lat <= 90:
                coordinates.append([lon, lat])
        if len(coordinates) >= 2:
            lines.append(coordinates)
    return lines


def fetch_boundaries(records, out, attempts, delay, batch_size, checkpoint=None):
    """Fetch full relation member geometry in bounded batches; no DB writes."""
    features = []
    report = {"requested_relations": len(records), "fetched_relations": 0,
              "missing_geometry": [], "failed_batches": [], "batch_count": 0}
    ids = [int(item["osm_id"]) for item in records]
    by_id = {item["osm_id"]: item for item in records}
    for offset in range(0, len(ids), batch_size):
        batch = ids[offset:offset + batch_size]
        query = "[out:json][timeout:180];\n(" + "".join(f"rel({osm_id});" for osm_id in batch) + "\n);\nout body geom;"
        report["batch_count"] += 1
        try:
            payload, request = overpass(query, attempts, delay, require_nonempty=True)
            returned = {str(item.get("id")): item for item in payload["elements"]
                        if item.get("type") == "relation"}
            for osm_id in batch:
                key = str(osm_id)
                relation = returned.get(key)
                lines = relation_lines(relation) if relation else []
                if not lines:
                    report["missing_geometry"].append(key)
                    continue
                properties = dict(by_id[key])
                properties["boundary_role_note"] = "OSM relation member ways; line geometry, not polygon topology"
                features.append({
                    "type": "Feature", "id": f"relation/{key}",
                    "geometry": {"type": "MultiLineString", "coordinates": lines},
                    "properties": properties,
                })
                report["fetched_relations"] += 1
            print(f"  Geometry batch {report['batch_count']}: {len(batch)} requested, "
                  f"{sum(1 for key in map(str, batch) if key in returned)} relations returned "
                  f"via {request['endpoint']}", flush=True)
        except Exception as error:
            report["failed_batches"].append({"osm_ids": [str(value) for value in batch],
                                             "error": str(error)})
            print(f"  Geometry batch {report['batch_count']} failed: {error}", file=sys.stderr, flush=True)
        # Persist after each batch so the caller can publish a resumable checkpoint.
        if checkpoint:
            checkpoint(features, report)
        save_json(out / "india-osm-district-boundaries.geojson",
              {"type": "FeatureCollection", "name": "India OSM district boundaries",
               "features": features})
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", default="all", help="State/UT name, or all")
    parser.add_argument("--attempts", type=int, default=2)
    parser.add_argument("--delay-seconds", type=float, default=3)
    parser.add_argument("--geometry-batch-size", type=int, default=10)
    parser.add_argument("--output-dir", default="artifacts/osm-districts")
    args = parser.parse_args()
    if not 1 <= args.attempts <= 4:
        parser.error("--attempts must be between 1 and 4")
    if not 0 <= args.delay_seconds <= 60:
        parser.error("--delay-seconds must be between 0 and 60")
    if not 1 <= args.geometry_batch_size <= 25:
        parser.error("--geometry-batch-size must be between 1 and 25")

    out = Path(args.output_dir)
    raw_dir = out / "raw"
    report = {"generated_at": now(), "source": "OpenStreetMap via public Overpass APIs",
              "discovery_level": 5, "boundary_geometry": "OSM relation member ways as MultiLineString",
              "state_count": 0, "successful_states": 0, "failed_states": 0,
              "district_count": 0, "unnamed_relations": [], "duplicate_osm_ids": [],
              "query_discrepancies": [], "states": []}

    print("Fetching India state/UT relation index...", flush=True)
    try:
        state_data, state_request = overpass(STATE_QUERY, args.attempts, args.delay_seconds, True)
    except Exception as error:
        report["states_index_error"] = str(error)
        save_json(out / "fetch-report.json", report)
        print(str(error), file=sys.stderr)
        return 1

    save_json(raw_dir / "india-states-index.json",
              {"fetched_at": now(), "query": STATE_QUERY, "request": state_request, "response": state_data})
    states = []
    for item in state_data["elements"]:
        tags = item.get("tags") or {}
        if item.get("type") != "relation" or str(tags.get("admin_level")) != "4":
            continue
        name = tags.get("name") or tags.get("name:en") or tags.get("official_name")
        if name:
            states.append({"name": name, "osm_id": int(item["id"]), "tags": tags})
    states.sort(key=lambda item: item["name"].casefold())
    if args.state.casefold() != "all":
        states = [item for item in states if item["name"].casefold() == args.state.casefold()]
        if not states:
            raise SystemExit("State/UT not found in OSM state index: " + args.state)

    report["state_count"] = len(states)
    all_districts = []
    for index, state in enumerate(states, 1):
        name = state["name"]
        print(f"[{index}/{len(states)}] {name}: querying both Overpass area strategies", flush=True)
        query_results = {}
        query_errors = []
        for strategy, query in district_queries(state):
            try:
                payload, request = overpass(query, args.attempts, args.delay_seconds)
                normalized = [item for element in payload["elements"]
                              if (item := normalize(element, state)) is not None]
                query_results[strategy] = {
                    "records": normalized, "raw": payload, "request": request,
                    "relation_ids": sorted({item["osm_id"] for item in normalized}, key=int),
                }
            except Exception as error:
                query_errors.append({"strategy": strategy, "error": str(error)})
        union = {}
        for result in query_results.values():
            for record in result["records"]:
                union[record["osm_id"]] = record
        if not union:
            report["failed_states"] += 1
            state_report = {"state_name": name, "state_osm_id": str(state["osm_id"]),
                            "complete": False, "count": 0, "query_errors": query_errors}
            print(f"  FAILED: neither strategy returned district relations", file=sys.stderr, flush=True)
        else:
            strategy_ids = {key: set(value["relation_ids"]) for key, value in query_results.items()}
            discrepancy = sorted(set.union(*strategy_ids.values()) - set.intersection(*strategy_ids.values()),
                                 key=int) if len(strategy_ids) > 1 else []
            if discrepancy:
                report["query_discrepancies"].append({
                    "state_name": name, "state_osm_id": str(state["osm_id"]),
                    "relation_ids_in_only_one_strategy": discrepancy,
                    "counts": {key: len(value) for key, value in strategy_ids.items()},
                })
            unnamed = [item["osm_id"] for item in union.values() if not item["has_name"]]
            report["unnamed_relations"].extend(unnamed)
            state_records = sorted(union.values(), key=lambda item: ((item["name"] or "").casefold(),
                                                                      int(item["osm_id"])))
            all_districts.extend(state_records)
            state_report = {
                "state_name": name, "state_osm_id": str(state["osm_id"]),
                "complete": not query_errors and len(query_results) == 2,
                "count": len(state_records),
                "strategy_counts": {key: len(value["records"]) for key, value in query_results.items()},
                "query_errors": query_errors,
                "discrepancy_count": len(discrepancy),
                "raw_files": [],
            }
            for strategy, result in query_results.items():
                raw_path = raw_dir / (slug(name) + "-" + strategy + ".json")
                save_json(raw_path, {"state": state, "strategy": strategy,
                                     "query": dict(district_queries(state))[strategy],
                                     "request": result["request"], "response": result["raw"]})
                state_report["raw_files"].append(str(raw_path.relative_to(out)))
            print(f"  {len(state_records)} unique relations; strategy counts "
                  f"{state_report['strategy_counts']}; discrepancy {len(discrepancy)}", flush=True)
            if state_report["complete"]:
                report["successful_states"] += 1
            else:
                report["failed_states"] += 1
        report["states"].append(state_report)
        if index < len(states):
            time.sleep(args.delay_seconds)

    seen = set()
    duplicates = set()
    for item in all_districts:
        if item["osm_id"] in seen:
            duplicates.add(item["osm_id"])
        seen.add(item["osm_id"])
    report["duplicate_osm_ids"] = sorted(duplicates, key=int)
    report["district_count"] = len(all_districts)
    save_json(out / "india-osm-districts.json",
              {"generated_at": report["generated_at"], "count": len(all_districts),
               "results": all_districts})

    centre_features = []
    for record in all_districts:
        center = record.get("center")
        if center and center.get("lon") is not None and center.get("lat") is not None:
            properties = {key: value for key, value in record.items() if key != "center"}
            centre_features.append({"type": "Feature", "id": "relation/" + record["osm_id"],
                                    "geometry": {"type": "Point", "coordinates": [center["lon"], center["lat"]]},
                                    "properties": properties})
    save_json(out / "india-osm-district-centres.geojson",
              {"type": "FeatureCollection", "name": "India OSM district centres",
               "features": centre_features})

    if all_districts:
        print(f"Fetching geometry for {len(all_districts)} unique district relations...", flush=True)
        report["geometry"] = fetch_boundaries(all_districts, out, args.attempts,
                                               args.delay_seconds, args.geometry_batch_size)
    else:
        report["geometry"] = {"requested_relations": 0, "fetched_relations": 0,
                              "missing_geometry": [], "failed_batches": [], "batch_count": 0}
    save_json(out / "fetch-report.json", report)
    print(f"Finished: {report['successful_states']} complete states, {report['failed_states']} "
          f"incomplete states, {report['district_count']} unique district relations, "
          f"{report['geometry']['fetched_relations']} boundaries.", flush=True)
    # Any incomplete state, discrepancy, or geometry failure must remain visible as a non-green run.
    return 1 if (report["failed_states"] or report["query_discrepancies"] or
                 report["geometry"]["missing_geometry"] or report["geometry"]["failed_batches"]) else 0


if __name__ == "__main__":
    raise SystemExit(main())
