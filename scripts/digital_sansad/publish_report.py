#!/usr/bin/env python3
"""Publish a completed Digital Sansad dry-run report to Supabase."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import requests


def main() -> int:
    report_path = Path(sys.argv[1] if len(sys.argv) > 1 else "digital-sansad-import-report.json")
    if not report_path.exists():
        print(f"Report not found: {report_path}", file=sys.stderr)
        return 1
    try:
        report = json.loads(report_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Unable to read report: {exc}", file=sys.stderr)
        return 1

    base_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not key:
        print("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.", file=sys.stderr)
        return 2

    unresolved = report.get("unresolved_constituencies") or []
    ambiguous = report.get("ambiguous_constituencies") or []
    unresolved_names = {
        str(item.get("constituency") or "").strip().casefold()
        for item in unresolved if item.get("constituency")
    }
    row = {
        "source": report.get("source") or "https://sansad.in/ls/members",
        "mode": report.get("mode") if report.get("mode") in ("dry-run", "apply") else "dry-run",
        "fetched_source_rows": int(report.get("fetched_source_rows") or 0),
        "advertised_source_total": report.get("advertised_source_total"),
        "unresolved_assignment_count": len(unresolved),
        "unresolved_unique_names": len(unresolved_names),
        "ambiguous_assignment_count": len(ambiguous),
        # Null is intentional: the current importer doesn't separately report former matches yet.
        "matched_former_count": None,
        "matched_defunct_count": len(report.get("matched_defunct_constituencies") or []),
        "report": report,
        "workflow_run_url": os.getenv("GITHUB_SERVER_URL", "https://github.com")
            + "/" + os.getenv("GITHUB_REPOSITORY", "kidave/citizenaction")
            + "/actions/runs/" + os.getenv("GITHUB_RUN_ID", ""),
        "status": "success",
    }
    endpoint = base_url.rstrip("/") + "/rest/v1/digital_sansad_import_reports"
    response = requests.post(
        endpoint,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        json=row,
        timeout=30,
    )
    if not response.ok:
        print(f"Supabase report publication failed: HTTP {response.status_code}: {response.text[:1000]}", file=sys.stderr)
        return 1
    print(
        "Published Digital Sansad report: "
        f"{row['fetched_source_rows']} fetched, "
        f"{row['unresolved_assignment_count']} unresolved assignments, "
        f"{row['ambiguous_assignment_count']} ambiguous assignments."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
