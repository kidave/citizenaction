#!/usr/bin/env python3
"""Read-only state-wise India OSM district fetcher using public Overpass APIs."""
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
    ("overpass.private.coffee", "https://overpass.private.coffee/api/interpreter", 75),
    ("maps.mail.ru", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", 55),
    ("overpass-api.de", "https://overpass-api.de/api/interpreter", 45),
]
USER_AGENT = "CitizenAction-OSM-District-Ingestion/1.0 (https://github.com/kidave/citizenaction)"
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


def overpass(query, attempts, delay):
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


def districts_query(state_relation_id):
    area_id = 3_600_000_000 + state_relation_id
    return f"""[out:json][timeout:90];
area(id:{area_id})->.stateArea;
rel["boundary"="administrative"]["admin_level"="5"](area.stateArea);
out tags center;"""


def normalize(element, state):
    tags = element.get("tags") or {}
    if element.get("type") != "relation" or not element.get("id") or str(tags.get("admin_level")) != "5":
        return None
    name = tags.get("name") or tags.get("name:en") or tags.get("official_name")
    if not name:
        return None
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
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", default="all", help="State/UT name, or all")
    parser.add_argument("--attempts", type=int, default=2)
    parser.add_argument("--delay-seconds", type=float, default=4)
    parser.add_argument("--output-dir", default="artifacts/osm-districts")
    args = parser.parse_args()
    if not 1 <= args.attempts <= 4:
        parser.error("--attempts must be between 1 and 4")
    if not 0 <= args.delay_seconds <= 60:
        parser.error("--delay-seconds must be between 0 and 60")

    out = Path(args.output_dir)
    raw_dir = out / "raw"
    report = {"generated_at": now(), "source": "OpenStreetMap via public Overpass APIs",
              "query_level": 5, "geometry": "centre points only; no district boundaries",
              "state_count": 0, "successful_states": 0, "failed_states": 0,
              "district_count": 0, "duplicate_osm_ids": [], "states": []}

    print("Fetching India state/UT relation index...", flush=True)
    try:
        state_data, state_request = overpass(STATE_QUERY, args.attempts, args.delay_seconds)
    except Exception as error:
        report["failed_states"] = 1
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
    if not states:
        report["failed_states"] = 1
        report["states_index_error"] = "India query returned no admin_level=4 state/UT relations"
        save_json(out / "fetch-report.json", report)
        return 1

    if args.state.casefold() != "all":
        states = [item for item in states if item["name"].casefold() == args.state.casefold()]
        if not states:
            raise SystemExit("State/UT not found in OSM state index: " + args.state)

    report["state_count"] = len(states)
    all_districts = []
    for index, state in enumerate(states, 1):
        name = state["name"]
        query = districts_query(state["osm_id"])
        print(f"[{index}/{len(states)}] {name}: fetching admin_level=5 relations", flush=True)
        result = {"state_name": name, "state_osm_id": str(state["osm_id"]),
                  "fetched_at": now(), "complete": False, "count": 0, "results": []}
        raw_response = None
        try:
            raw_response, request_meta = overpass(query, args.attempts, args.delay_seconds)
            records = [record for item in raw_response["elements"]
                       if (record := normalize(item, state)) is not None]
            if not records:
                raise RuntimeError("No valid admin_level=5 district relations in response")
            result.update({"complete": True, "count": len(records),
                           "osm_timestamp": (raw_response.get("osm3s") or {}).get("timestamp_osm_base"),
                           "request": request_meta, "results": records})
            all_districts.extend(records)
            report["successful_states"] += 1
            print(f"  {len(records)} district relations", flush=True)
        except Exception as error:
            result["error"] = str(error)
            report["failed_states"] += 1
            print(f"  FAILED: {error}", file=sys.stderr, flush=True)

        save_json(raw_dir / (slug(name) + ".json"),
                  {"fetched_at": result["fetched_at"], "state": state, "query": query,
                   "result": result, "overpass_response": raw_response})
        report["states"].append({"state_name": name, "state_osm_id": str(state["osm_id"]),
                                 "complete": result["complete"], "count": result["count"],
                                 "error": result.get("error"), "raw_file": "raw/" + slug(name) + ".json"})
        if index < len(states):
            time.sleep(args.delay_seconds)

    ids = [record["osm_id"] for record in all_districts]
    report["duplicate_osm_ids"] = sorted({osm_id for osm_id in ids if ids.count(osm_id) > 1})
    report["district_count"] = len(all_districts)
    report["states"].sort(key=lambda item: item["state_name"].casefold())
    save_json(out / "fetch-report.json", report)
    save_json(out / "india-osm-districts.json",
              {"generated_at": report["generated_at"], "count": len(all_districts),
               "results": sorted(all_districts, key=lambda item: (item["state_name"].casefold(),
                                                                    item["name"].casefold()))})
    features = []
    for record in all_districts:
        center = record.get("center")
        if center and center.get("lon") is not None and center.get("lat") is not None:
            props = {key: value for key, value in record.items() if key != "center"}
            features.append({"type": "Feature", "id": "relation/" + record["osm_id"],
                             "geometry": {"type": "Point", "coordinates": [center["lon"], center["lat"]]},
                             "properties": props})
    save_json(out / "india-osm-district-centres.geojson",
              {"type": "FeatureCollection", "name": "India OSM district centres", "features": features})
    print(f"Finished: {report['successful_states']} successful, {report['failed_states']} failed, "
          f"{report['district_count']} districts.", flush=True)
    return 1 if report["failed_states"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
