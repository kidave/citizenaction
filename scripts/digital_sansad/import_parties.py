#!/usr/bin/env python3
"""Import Digital Sansad party records into public.governance.

Provide a JSON file containing the Digital Sansad party array. Dry-run is the
default; use --apply only after reviewing the preview. Existing Citizen Action
UUIDs remain unchanged and source identity is stored in governance columns.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from typing import Any

import requests

SOURCE_SYSTEM = "digital_sansad"


def clean(value: Any) -> str | None:
    if value is None or isinstance(value, (dict, list)):
        return None
    value = str(value).strip()
    return value or None


def normalize(value: str | None) -> str:
    if not value:
        return ""
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def slugify(value: str) -> str:
    return re.sub(r"-+", "-", normalize(value).replace(" ", "-")).strip("-") or "unknown"


def request(method: str, url: str, key: str, **kwargs: Any) -> requests.Response:
    headers = kwargs.pop("headers", {})
    headers.update({
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    })
    response = requests.request(method, url, headers=headers, timeout=45, **kwargs)
    if not response.ok:
        raise RuntimeError(f"Supabase {method} failed ({response.status_code}): {response.text[:800]}")
    return response


def fetch_parties(base_url: str, key: str) -> list[dict[str, Any]]:
    url = base_url.rstrip("/") + "/rest/v1/governance"
    rows: list[dict[str, Any]] = []
    offset = 0
    size = 1000
    while True:
        response = request(
            "GET", url, key,
            params={
                "select": "id,name,short_name,slug,type,source_system,source_id,metadata",
                "type": "eq.political_party",
                "limit": size,
                "offset": offset,
            },
            headers={"Range-Unit": "items", "Range": f"{offset}-{offset + size - 1}"},
        )
        batch = response.json()
        if not isinstance(batch, list):
            raise RuntimeError("Unexpected governance response from Supabase.")
        rows.extend(batch)
        if len(batch) < size:
            return rows
        offset += len(batch)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_json", help="Path to the Digital Sansad party JSON array")
    parser.add_argument("--apply", action="store_true", help="Write changes to Supabase; default is dry-run")
    parser.add_argument("--report", default="digital-sansad-party-import-report.json")
    args = parser.parse_args()

    base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if args.apply and (not base_url or not key):
        print("ERROR: --apply requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.", file=sys.stderr)
        return 2

    try:
        with open(args.input_json, "r", encoding="utf-8-sig") as handle:
            source_rows = json.load(handle)
        if not isinstance(source_rows, list):
            raise ValueError("Party input must be a JSON array.")
        parties = []
        seen_codes: set[str] = set()
        for row in source_rows:
            if not isinstance(row, dict):
                continue
            source_id = clean(row.get("party_code"))
            name = clean(row.get("party_fname"))
            short_name = clean(row.get("party_sname"))
            if not source_id or not name:
                continue
            if source_id in seen_codes:
                raise ValueError(f"Duplicate party_code {source_id!r} in source file; refusing to import.")
            seen_codes.add(source_id)
            parties.append({
                "source_system": SOURCE_SYSTEM,
                "source_id": source_id,
                "name": name,
                "short_name": short_name,
                "slug": slugify(name),
                "type": "political_party",
                "metadata": {
                    "official_source": "Digital Sansad",
                    "official_source_url": "https://sansad.in/ls/members",
                    "party_name_hindi": clean(row.get("party_fname_h")),
                    "party_leader_source": clean(row.get("leader")),
                    "party_leader_hindi_source": clean(row.get("leader_h")),
                    "party_mp_code": clean(row.get("mpCode")),
                    "party_ls_to": clean(row.get("lsTo")),
                    "party_represent_as_on_date": row.get("representAsOnDate"),
                },
            })
        if not parties:
            raise ValueError("No valid party records with party_code and party_fname were found.")

        existing = fetch_parties(base_url, key) if base_url and key else []
        by_source: dict[str, dict[str, Any]] = {}
        for row in existing:
            if row.get("source_system") == SOURCE_SYSTEM and clean(row.get("source_id")):
                source_id = clean(row.get("source_id"))
                if source_id in by_source:
                    raise ValueError(f"Duplicate existing governance source identity {SOURCE_SYSTEM}:{source_id}; fix before importing.")
                by_source[source_id] = row

        inserts: list[dict[str, Any]] = []
        updates: list[tuple[dict[str, Any], dict[str, Any]]] = []
        ambiguous: list[dict[str, Any]] = []
        matched = 0

        for incoming in parties:
            source_id = incoming["source_id"]
            current = by_source.get(source_id)
            if current is None:
                # Safe fallback for records created before source identifiers existed.
                labels = {normalize(incoming["name"])}
                if incoming.get("short_name"):
                    labels.add(normalize(incoming["short_name"]))
                matches = [
                    row for row in existing
                    if normalize(clean(row.get("name"))) in labels
                    or normalize(clean(row.get("short_name"))) in labels
                    or normalize(clean(row.get("slug")).replace("-", " ")) in labels
                ]
                conflicting_source_match = any(
                    row.get("source_system") == SOURCE_SYSTEM
                    and clean(row.get("source_id"))
                    and clean(row.get("source_id")) != source_id
                    for row in matches
                )
                if len(matches) == 1 and not conflicting_source_match:
                    current = matches[0]
                elif matches:
                    ambiguous.append({
                        "source_id": source_id,
                        "name": incoming["name"],
                        "matching_governance_ids": [row.get("id") for row in matches],
                        "reason": "Conflicting source identity" if conflicting_source_match else "Multiple name matches",
                    })
                    continue

            if current is None:
                inserts.append(incoming)
                continue

            matched += 1
            patch: dict[str, Any] = {}
            if not current.get("source_system") and not current.get("source_id"):
                patch.update({"source_system": SOURCE_SYSTEM, "source_id": source_id})
            # Enrich only blank display fields and preserve unrelated/user metadata.
            for field in ("name", "short_name", "slug"):
                if not current.get(field) and incoming.get(field):
                    patch[field] = incoming[field]
            old_meta = current.get("metadata") if isinstance(current.get("metadata"), dict) else {}
            merged_meta = dict(old_meta)
            for field, value in incoming["metadata"].items():
                if value is not None and not merged_meta.get(field):
                    merged_meta[field] = value
            if merged_meta != old_meta:
                patch["metadata"] = merged_meta
            if patch:
                updates.append((current, patch))

        report = {
            "source": "Digital Sansad party dataset supplied as local JSON",
            "source_system": SOURCE_SYSTEM,
            "source_rows": len(source_rows),
            "valid_unique_parties": len(parties),
            "existing_parties_scanned": len(existing),
            "matched_existing_parties": matched,
            "planned_inserts": len(inserts),
            "planned_updates": len(updates),
            "ambiguous_matches_skipped": ambiguous,
            "mode": "apply" if args.apply else "dry-run",
            "results": {"inserted": 0, "updated": 0, "errors": []},
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))

        if args.apply:
            url = base_url.rstrip("/") + "/rest/v1/governance"
            for incoming in inserts:
                try:
                    response = request("POST", url, key, json={**incoming, "status": "active"},
                                       headers={"Prefer": "return=representation"})
                    payload = response.json()
                    if not isinstance(payload, list) or not payload:
                        raise RuntimeError("Insert returned no governance record.")
                    report["results"]["inserted"] += 1
                except Exception as exc:
                    report["results"]["errors"].append({
                        "operation": "insert", "source_id": incoming["source_id"], "error": str(exc)
                    })
                    # Avoid further writes after an uncertain insert failure.
                    break
            if not report["results"]["errors"]:
                for current, patch in updates:
                    try:
                        request("PATCH", url, key, params={"id": f"eq.{current['id']}"},
                                json=patch, headers={"Prefer": "return=minimal"})
                        report["results"]["updated"] += 1
                    except Exception as exc:
                        report["results"]["errors"].append({
                            "operation": "update", "id": current.get("id"), "error": str(exc)
                        })

        with open(args.report, "w", encoding="utf-8") as handle:
            json.dump(report, handle, ensure_ascii=False, indent=2)
        print(f"Report written to {args.report}")
        return 1 if report["results"]["errors"] else 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
