#!/usr/bin/env python3
"""Export public.geographies to a single validated GeoJSON FeatureCollection."""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import requests

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OUTPUT_PATH = Path(os.environ.get("OUTPUT_PATH", "citizenaction-geographies.geojson"))
BATCH_SIZE = min(max(int(os.environ.get("BATCH_SIZE", "250")), 1), 500)
RPC_URL = f"{SUPABASE_URL}/rest/v1/rpc/export_geographies_geojson"


def require_environment() -> None:
    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", SUPABASE_URL),
            ("SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")


def fetch_batch(
    session: requests.Session,
    after_id: str | None,
) -> dict[str, Any]:
    payload = {"p_after_id": after_id, "p_limit": BATCH_SIZE}

    for attempt in range(1, 5):
        try:
            response = session.post(RPC_URL, json=payload, timeout=(15, 120))
            response.raise_for_status()
            result = response.json()
            if not isinstance(result, dict) or result.get("type") != "FeatureCollection":
                raise RuntimeError("Export RPC returned an unexpected response.")
            if not isinstance(result.get("features"), list):
                raise RuntimeError("Export RPC response is missing its features array.")
            return result
        except (requests.RequestException, ValueError) as error:
            if attempt == 4:
                raise RuntimeError(f"Supabase export request failed: {error}") from error
            wait_seconds = min(2**attempt, 15)
            print(f"Request failed (attempt {attempt}/4); retrying in {wait_seconds}s: {error}")
            time.sleep(wait_seconds)

    raise RuntimeError("Unable to fetch geography batch.")


def validate_feature(feature: Any) -> str:
    if not isinstance(feature, dict) or feature.get("type") != "Feature":
        raise RuntimeError("An exported item is not a GeoJSON Feature.")

    feature_id = feature.get("id")
    geometry = feature.get("geometry")
    properties = feature.get("properties")

    if not isinstance(feature_id, str) or not feature_id:
        raise RuntimeError("A feature is missing its stable string ID.")
    if not isinstance(geometry, dict) or not geometry.get("type"):
        raise RuntimeError(f"Feature {feature_id} has invalid geometry.")
    if not isinstance(properties, dict) or properties.get("id") != feature_id:
        raise RuntimeError(f"Feature {feature_id} has inconsistent properties.")

    return feature_id


def export() -> None:
    require_environment()

    session = requests.Session()
    session.headers.update(
        {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = OUTPUT_PATH.with_suffix(OUTPUT_PATH.suffix + ".tmp")

    exported = 0
    after_id: str | None = None
    seen_ids: set[str] = set()

    print(f"Exporting geography boundaries in batches of {BATCH_SIZE}...")

    try:
        with temporary_path.open("w", encoding="utf-8") as output:
            output.write('{"type":"FeatureCollection","features":[')

            while True:
                batch = fetch_batch(session, after_id)
                features = batch["features"]

                for feature in features:
                    feature_id = validate_feature(feature)
                    if feature_id in seen_ids:
                        raise RuntimeError(f"Duplicate geography ID encountered: {feature_id}")
                    seen_ids.add(feature_id)

                    if exported:
                        output.write(",")
                    json.dump(feature, output, ensure_ascii=False, separators=(",", ":"))
                    exported += 1

                next_after_id = batch.get("next_after_id")
                has_more = bool(batch.get("has_more"))

                print(f"Exported {exported:,} features")

                if not has_more:
                    break
                if not features or not next_after_id or next_after_id == after_id:
                    raise RuntimeError("Pagination stopped progressing; export was not finalized.")

                after_id = next_after_id

            output.write("]}")

        # Parse the completed file before publishing it as the final artifact.
        with temporary_path.open("r", encoding="utf-8") as exported_file:
            collection = json.load(exported_file)

        if collection.get("type") != "FeatureCollection":
            raise RuntimeError("Final output is not a GeoJSON FeatureCollection.")
        if len(collection.get("features", [])) != exported:
            raise RuntimeError("Final GeoJSON feature count does not match the export count.")

        temporary_path.replace(OUTPUT_PATH)

    except Exception:
        temporary_path.unlink(missing_ok=True)
        raise
    finally:
        session.close()

    size_mb = OUTPUT_PATH.stat().st_size / (1024 * 1024)
    print("GeoJSON export completed and validated.")
    print(f"Features: {exported:,}")
    print(f"Unique IDs: {len(seen_ids):,}")
    print(f"File size: {size_mb:.2f} MB")
    print(f"Output: {OUTPUT_PATH.resolve()}")

    if exported == 0:
        raise RuntimeError("No geography features were exported.")


if __name__ == "__main__":
    try:
        export()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
