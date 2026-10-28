#!/usr/bin/env python3
"""Import unique Lok Sabha members from the Digital Sansad public directory.

Safe by default: run without --apply to preview. The script never deletes rows
and never creates parliamentary appointments. It only inserts missing people
or enriches source-linked/exact-name matches with missing public fields.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from collections import defaultdict
from datetime import date, datetime
from typing import Any

import requests

API_URL = "https://sansad.in/api_ls/member"
SOURCE_URL = "https://sansad.in/ls/members"
DEFAULT_PAGE_SIZE = 100
PAGE_PAUSE_SECONDS = 0.15
HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": SOURCE_URL,
    "User-Agent": "CitizenActionDataImporter/1.0 (public civic data; contact via repository)",
}
# Keep this list intentionally limited to public biographical/professional fields.
PERSONAL_FIELDS = {
    "name", "image_url", "qualification", "profession", "birth_date", "metadata"
}


def clean(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return None
    value = str(value).strip()
    return value or None


def first(record: dict[str, Any], *keys: str) -> Any:
    """Return first non-empty value, case-insensitively."""
    lowered = {str(k).lower(): v for k, v in record.items()}
    for key in keys:
        value = lowered.get(key.lower())
        if value not in (None, ""):
            return value
    return None


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    # Honorifics commonly used in the directory are not part of identity.
    value = re.sub(r"^(shri|smt|dr|prof|kumari|miss|mr|mrs|ms)\s+", "", value)
    return re.sub(r"\s+", " ", value)


def parse_date(value: Any) -> str | None:
    value = clean(value)
    if not value:
        return None
    candidates = (value, value[:10])
    formats = (
        "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%Y-%m-%dT%H:%M:%S", "%d %b %Y", "%d %B %Y",
    )
    for candidate in candidates:
        for fmt in formats:
            try:
                parsed = datetime.strptime(candidate, fmt).date()
                if date(1900, 1, 1) <= parsed <= date.today():
                    return parsed.isoformat()
            except ValueError:
                continue
    return None


def unwrap_page(payload: Any) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Handle common Spring/Java API response envelopes without guessing silently."""
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)], {}
    if not isinstance(payload, dict):
        raise ValueError(f"Unexpected API payload type: {type(payload).__name__}")

    # Current Digital Sansad response envelope.
    if isinstance(payload.get("membersDtoList"), list):
        meta = payload.get("metaDatasDto") if isinstance(payload.get("metaDatasDto"), dict) else payload
        return [x for x in payload["membersDtoList"] if isinstance(x, dict)], meta

    meta = payload
    for key in ("data", "result", "response", "payload"):
        candidate = payload.get(key)
        if isinstance(candidate, dict):
            meta = {**payload, **candidate}
            payload = candidate
            break

    for key in ("content", "members", "results", "items", "records", "data"):
        candidate = payload.get(key) if isinstance(payload, dict) else None
        if isinstance(candidate, list):
            return [x for x in candidate if isinstance(x, dict)], meta
    if isinstance(payload, dict) and any(k in payload for k in ("mpsno", "fullName", "name")):
        return [payload], meta
    raise ValueError(
        "Could not identify the member list in the API response. "
        f"Top-level keys: {list(meta.keys())[:30]}"
    )


def fetch_all_members(page_size: int, max_pages: int, timeout: int, limit_records: int | None = None) -> tuple[list[dict[str, Any]], int | None]:
    session = requests.Session()
    session.headers.update(HEADERS)
    members: list[dict[str, Any]] = []
    total_elements: int | None = None
    total_pages: int | None = None

    effective_page_size = min(page_size, limit_records) if limit_records else page_size
    for page in range(1, max_pages + 1):
        params = {
            "state": "", "party": "", "constituency": "", "gender": "",
            "ageFrom": "", "ageTo": "", "noOfTerms": "", "page": page,
            "size": effective_page_size, "searchText": "", "locale": "en",
            "loksabha": "", "month": "", "profession": "",
            "otherProfession": "", "constituencyCategory": "", "positionCode": "",
            "qualification": "", "noOfChildren": "", "isFreedomFighter": "",
            "memberStatus": "", "isNominated": "",
        }
        response = session.get(API_URL, params=params, timeout=timeout)
        response.raise_for_status()
        payload = response.json()
        page_records, meta = unwrap_page(payload)
        if not page_records:
            break

        if total_elements is None:
            for key in ("totalElements", "total_elements", "totalCount", "total"):
                try:
                    if meta.get(key) is not None:
                        total_elements = int(meta[key])
                        break
                except (TypeError, ValueError):
                    pass
            for key in ("totalPages", "total_pages", "pages"):
                try:
                    if meta.get(key) is not None:
                        total_pages = int(meta[key])
                        break
                except (TypeError, ValueError):
                    pass

        if limit_records:
            page_records = page_records[: max(0, limit_records - len(members))]
        members.extend(page_records)
        print(f"Fetched page {page}: {len(page_records)} records (total fetched: {len(members)})")
        if limit_records and len(members) >= limit_records:
            break
        if total_pages is not None and page >= total_pages:
            break
        if len(page_records) < page_size:
            break
        time.sleep(PAGE_PAUSE_SECONDS)

    # A deliberately limited sample is for testing only; do not compare it to global totals.
    if limit_records:
        return members, total_elements

    # If the API advertises pagination totals, refuse incomplete retrieval.
    if total_pages is not None and len(members) < total_pages * page_size and len(members) < (total_elements or 0):
        if len(members) < (total_elements or 0):
            raise RuntimeError(
                f"Pagination ended at {len(members)} records, but API advertised "
                f"{total_elements} total records / {total_pages} pages."
            )
    if total_elements is not None and len(members) < total_elements:
        raise RuntimeError(f"Incomplete API fetch: got {len(members)} of {total_elements} records.")
    return members, total_elements


def source_identity(record: dict[str, Any]) -> str | None:
    value = first(record, "mpsno", "mpSno", "mpCode", "memberCode", "memberId", "id")
    return clean(value)


def to_person(record: dict[str, Any]) -> dict[str, Any] | None:
    name = clean(first(record, "fullName", "full_name", "memberName", "name", "mpName", "displayName"))
    if not name:
        first_name = clean(first(record, "firstName", "first_name"))
        last_name = clean(first(record, "lastName", "last_name", "surname"))
        name = " ".join(x for x in (first_name, last_name) if x)
    if not name:
        return None

    mpsno = source_identity(record)
    if not mpsno:
        # No stable identifier means we cannot safely deduplicate this source row.
        return None

    image_url = clean(first(record, "photoUrl", "photoURL", "imageUrl", "image_url", "photo", "image", "memberPhoto"))
    if isinstance(image_url, str) and image_url.startswith("/"):
        image_url = "https://sansad.in" + image_url

    metadata: dict[str, Any] = {
        "official_source": "Digital Sansad",
        "official_source_url": SOURCE_URL,
        "mpsno": mpsno,
    }
    source_fields = {
        "lsExpr": ("lsExpr", "ls_expr", "lokSabhaExperience"),
        "noOfTerms": ("noOfTerms", "no_of_terms", "termsServed"),
        "status": ("status", "memberStatus"),
        "constituency": ("constituency", "constituencyName", "constName"),
        "party_source_name": ("partyFname", "partyName", "party"),
        "party": ("party", "partyName", "partyFname"),
        "party_short_name": ("partySname",),
        "gender": ("gender",),
        "constituencyCategory": ("constituencyCategory", "constituency_category"),
        "state": ("state", "stateName"),
        "profession2": ("profession2", "otherProfession"),
    }
    for target, keys in source_fields.items():
        value = clean(first(record, *keys))
        if value is not None:
            metadata[target] = value

    person: dict[str, Any] = {"name": name, "metadata": metadata}
    if image_url and image_url.startswith(("https://", "http://")):
        person["image_url"] = image_url
    qualification = clean(first(record, "qualification", "educationalQualification", "education"))
    profession = clean(first(record, "profession", "occupation"))
    birth_date = parse_date(first(record, "birthdate", "birthDate", "dateOfBirth", "dob"))
    if qualification:
        person["qualification"] = qualification
    if profession:
        person["profession"] = profession
    if birth_date:
        person["birth_date"] = birth_date
    return person


def supabase_request(method: str, url: str, key: str, **kwargs: Any) -> requests.Response:
    headers = kwargs.pop("headers", {})
    headers.update({
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    })
    response = requests.request(method, url, headers=headers, timeout=45, **kwargs)
    if not response.ok:
        raise RuntimeError(f"Supabase {method} {url} failed ({response.status_code}): {response.text[:1000]}")
    return response


def fetch_existing_people(base_url: str, key: str) -> list[dict[str, Any]]:
    url = base_url.rstrip("/") + "/rest/v1/person"
    people: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    while True:
        response = supabase_request(
            "GET", url, key,
            params={"select": "id,name,metadata,image_url,qualification,profession,birth_date", "limit": page_size, "offset": offset},
            headers={"Range-Unit": "items", "Range": f"{offset}-{offset + page_size - 1}"},
        )
        batch = response.json()
        if not isinstance(batch, list):
            raise RuntimeError("Supabase person query returned an unexpected response.")
        people.extend(batch)
        if len(batch) < page_size:
            break
        offset += len(batch)
    return people


def slugify(value: str) -> str:
    value = normalize_name(value).replace(" ", "-")
    return re.sub(r"-+", "-", value).strip("-") or "unknown"


def fetch_rest_rows(base_url: str, key: str, table: str, select: str, filters: dict[str, str] | None = None) -> list[dict[str, Any]]:
    url = base_url.rstrip("/") + f"/rest/v1/{table}"
    rows: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    while True:
        params = {"select": select, "limit": page_size, "offset": offset}
        params.update(filters or {})
        response = supabase_request("GET", url, key, params=params,
            headers={"Range-Unit": "items", "Range": f"{offset}-{offset + page_size - 1}"})
        batch = response.json()
        if not isinstance(batch, list):
            raise RuntimeError(f"Supabase {table} query returned an unexpected response.")
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += len(batch)
    return rows


def upload_member_photo(base_url: str, key: str, source_url: str, source_id: str, name: str) -> str | None:
    """Copy official photo into the existing public governance bucket; return its public URL."""
    try:
        response = requests.get(source_url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
        extension_by_type = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp"}
        extension = extension_by_type.get(content_type)
        if not extension or not response.content or len(response.content) > 5 * 1024 * 1024:
            print(f"WARNING: skipped unsupported/empty/oversized photo for {name} ({source_id}); content-type={content_type!r}")
            return None
        path = f"person/{slugify(name)}-{source_id}/profile.{extension}"
        object_url = base_url.rstrip("/") + "/storage/v1/object/governance/" + requests.utils.quote(path, safe="/")
        headers = {
            "apikey": key, "Authorization": f"Bearer {key}",
            "Content-Type": content_type, "x-upsert": "true",
            "Cache-Control": "3600",
        }
        uploaded = requests.post(object_url, headers=headers, data=response.content, timeout=45)
        if not uploaded.ok:
            print(f"WARNING: photo upload failed for {name} ({source_id}): HTTP {uploaded.status_code}")
            return None
        return base_url.rstrip("/") + "/storage/v1/object/public/governance/" + requests.utils.quote(path, safe="/")
    except Exception as exc:
        print(f"WARNING: photo copy failed for {name} ({source_id}): {exc}")
        return None


def resolve_geography(name: str | None, geographies: list[dict[str, Any]]) -> tuple[str | None, bool]:
    if not name:
        return None, False
    key = normalize_name(name)
    matches = [g for g in geographies if key in {
        normalize_name(str(g.get("name") or "")),
        normalize_name(str(g.get("official_name") or "")),
        normalize_name(str(g.get("slug") or "").replace("-", " ")),
    }]
    return (str(matches[0]["id"]), False) if len(matches) == 1 else (None, len(matches) > 1)


def resolve_party(name: str | None, parties: list[dict[str, Any]]) -> tuple[dict[str, Any] | None, bool]:
    if not name:
        return None, False
    key = normalize_name(name)
    matches = [p for p in parties if key in {
        normalize_name(str(p.get("name") or "")),
        normalize_name(str(p.get("short_name") or "")),
        normalize_name(str(p.get("slug") or "").replace("-", " ")),
    }]
    return (matches[0], False) if len(matches) == 1 else (None, len(matches) > 1)



def merge_missing(existing: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    """Only enrich blanks and merge the importer-owned metadata keys."""
    patch: dict[str, Any] = {}
    for field in ("image_url", "qualification", "profession", "birth_date"):
        if not existing.get(field) and incoming.get(field):
            patch[field] = incoming[field]

    old_metadata = existing.get("metadata") if isinstance(existing.get("metadata"), dict) else {}
    new_metadata = incoming.get("metadata") or {}
    merged = dict(old_metadata)
    # Preserve unrelated/user-created metadata. Update only fields this importer owns.
    for key, value in new_metadata.items():
        if key in {"official_source", "official_source_url", "mpsno", "lsExpr", "noOfTerms", "status",
                   "constituency", "party", "party_short_name", "party_source_name", "gender", "constituencyCategory", "state", "profession2", "constituency_geography_id", "party_governance_id"}:
            if value is not None:
                merged[key] = value
    if merged != old_metadata:
        patch["metadata"] = merged
    return patch


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true", help="Write changes to Supabase. Without this flag, only preview.")
    parser.add_argument("--page-size", type=int, default=DEFAULT_PAGE_SIZE)
    parser.add_argument("--max-pages", type=int, default=1000)
    parser.add_argument("--limit-records", type=int, default=None,
                        help="Fetch only this many source rows for a small test.")
    parser.add_argument("--min-source-records", type=int, default=1000,
                        help="Fail closed if fewer source rows are returned (protects against partial/API errors).")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--report", default="digital-sansad-import-report.json")
    args = parser.parse_args()

    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if args.apply and (not supabase_url or not supabase_key):
        print("ERROR: --apply requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.", file=sys.stderr)
        return 2

    try:
        if args.limit_records is not None and args.limit_records < 1:
            raise ValueError("--limit-records must be at least 1.")
        source_rows, advertised_total = fetch_all_members(args.page_size, args.max_pages, args.timeout, args.limit_records)
    except Exception as exc:
        print(f"ERROR fetching Digital Sansad: {exc}", file=sys.stderr)
        return 1

    if args.limit_records is None and len(source_rows) < args.min_source_records:
        print(
            f"ERROR: only {len(source_rows)} source records fetched (minimum {args.min_source_records}); "
            "refusing to proceed because this may be a partial response.",
            file=sys.stderr,
        )
        return 1

    source_people: dict[str, dict[str, Any]] = {}
    rejected_rows = 0
    for row in source_rows:
        person = to_person(row)
        if not person:
            rejected_rows += 1
            continue
        source_id = person["metadata"]["mpsno"]
        # Duplicate source IDs collapse to one person; prefer the record with more fields.
        current = source_people.get(source_id)
        if current is None or len(person) > len(current):
            source_people[source_id] = person

    if not source_people:
        print("ERROR: no usable member records with stable source IDs were found.", file=sys.stderr)
        return 1

    existing_people: list[dict[str, Any]] = []
    existing_geographies: list[dict[str, Any]] = []
    existing_governance: list[dict[str, Any]] = []
    if supabase_url and supabase_key:
        try:
            existing_people = fetch_existing_people(supabase_url, supabase_key)
            existing_geographies = fetch_rest_rows(supabase_url, supabase_key, "geographies", "id,name,official_name,slug,geography_type,boundary_category", {"geography_type": "eq.parliamentary_constituency", "boundary_category": "eq.political"})
            existing_governance = fetch_rest_rows(supabase_url, supabase_key, "governance", "id,name,short_name,slug,type,metadata")
        except Exception as exc:
            print(f"ERROR reading existing people from Supabase: {exc}", file=sys.stderr)
            return 1
    elif args.apply:
        print("ERROR: Supabase credentials are required to apply.", file=sys.stderr)
        return 2
    else:
        print("NOTE: Supabase credentials not set; preview will show source totals only.")

    by_source_id: dict[str, dict[str, Any]] = {}
    by_name: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for existing in existing_people:
        metadata = existing.get("metadata") if isinstance(existing.get("metadata"), dict) else {}
        source_id = clean(metadata.get("mpsno"))
        if source_id and metadata.get("official_source") == "Digital Sansad":
            by_source_id[source_id] = existing
        name = clean(existing.get("name"))
        if name:
            by_name[normalize_name(name)].append(existing)

    inserts: list[dict[str, Any]] = []
    unresolved_constituencies: list[dict[str, Any]] = []
    unresolved_parties: list[dict[str, Any]] = []
    ambiguous_constituencies: list[dict[str, Any]] = []
    ambiguous_parties: list[dict[str, Any]] = []
    party_to_create: dict[str, dict[str, Any]] = {}
    updates: list[tuple[dict[str, Any], dict[str, Any]]] = []
    ambiguous: list[dict[str, Any]] = []
    matched_existing = 0

    for source_id, incoming in source_people.items():
        source_meta = incoming.get("metadata") or {}
        constituency_name = clean(source_meta.get("constituency"))
        geography_id, geography_ambiguous = resolve_geography(constituency_name, existing_geographies)
        if geography_id:
            source_meta["constituency_geography_id"] = geography_id
        elif constituency_name:
            item = {"mpsno": source_id, "name": incoming["name"], "constituency": constituency_name}
            (ambiguous_constituencies if geography_ambiguous else unresolved_constituencies).append(item)

        party_name = clean(source_meta.get("party_source_name")) or clean(source_meta.get("party_short_name"))
        party, party_ambiguous = resolve_party(party_name, existing_governance)
        if party:
            source_meta["party_governance_id"] = party["id"]
        elif party_name and not party_ambiguous:
            party_key = normalize_name(party_name)
            if party_key:
                party_to_create.setdefault(party_key, {"name": party_name, "slug": slugify(party_name), "type": "political_party",
                    "short_name": clean(source_meta.get("party_short_name")), "metadata": {
                        "official_source": "Digital Sansad", "party_name": party_name,
                        "party_short_name": clean(source_meta.get("party_short_name"))}})
        elif party_name and party_ambiguous:
            ambiguous_parties.append({"mpsno": source_id, "name": incoming["name"], "party": party_name})

        existing = by_source_id.get(source_id)
        if existing is None:
            name_key = normalize_name(incoming["name"])
            name_matches = by_name.get(name_key, [])
            if len(name_matches) == 1:
                existing = name_matches[0]
            elif len(name_matches) > 1:
                ambiguous.append({"mpsno": source_id, "name": incoming["name"], "matching_person_ids": [p.get("id") for p in name_matches]})
                continue

        if existing is None:
            inserts.append(incoming)
            continue
        matched_existing += 1
        patch = merge_missing(existing, incoming)
        # Store official identity on a unique exact-name match, while retaining other metadata.
        if patch:
            updates.append((existing, patch))

    report = {
        "source": SOURCE_URL,
        "api_url": API_URL,
        "fetched_source_rows": len(source_rows),
        "advertised_source_total": advertised_total,
        "unique_members_with_source_id": len(source_people),
        "rows_without_name_or_stable_id": rejected_rows,
        "existing_people_scanned": len(existing_people),
        "matched_existing_people": matched_existing,
        "planned_inserts": len(inserts),
        "planned_updates": len(updates),
        "ambiguous_name_matches_skipped": ambiguous,
        "unresolved_constituencies": unresolved_constituencies,
        "ambiguous_constituencies": ambiguous_constituencies,
        "unresolved_parties": unresolved_parties,
        "ambiguous_parties": ambiguous_parties,
        "planned_party_entities": len(party_to_create),
        "mode": "apply" if args.apply else "dry-run",
        "sample_limit_records": args.limit_records,
        "results": {"inserted": 0, "updated": 0, "errors": []},
    }

    print("\nImport preview")
    print(json.dumps({k: v for k, v in report.items() if k != "ambiguous_name_matches_skipped"}, indent=2, ensure_ascii=False))
    if ambiguous:
        print(f"Ambiguous name matches skipped: {len(ambiguous)} (see report file).")

    if args.apply:
        rest_url = supabase_url.rstrip("/") + "/rest/v1/person"
        governance_url = supabase_url.rstrip("/") + "/rest/v1/governance"
        # Create unresolved party entities only after the operator explicitly selects --apply.
        # Requires the database enum migration adding governance_type='political_party'.
        for party_key, party in list(party_to_create.items()):
            try:
                slug = party["slug"]
                existing_slug = [p for p in existing_governance if normalize_name(str(p.get("slug") or "").replace("-", " ")) == party_key]
                if existing_slug:
                    party["id"] = existing_slug[0]["id"]
                else:
                    created = supabase_request("POST", governance_url, supabase_key, json={**party, "status": "active"},
                        headers={"Prefer": "return=representation"})
                    payload = created.json()
                    if isinstance(payload, list) and payload:
                        party["id"] = payload[0].get("id")
                    if not party.get("id"):
                        # Re-read by slug if PostgREST did not return a representation.
                        found = fetch_rest_rows(supabase_url, supabase_key, "governance", "id,name,short_name,slug,type,metadata", {"slug": f"eq.{slug}"})
                        if found:
                            party["id"] = found[0]["id"]
                if party.get("id"):
                    existing_governance.append(party)
                else:
                    report["results"]["errors"].append({"operation": "create_party", "name": party["name"], "error": "Created party but could not resolve its ID."})
            except Exception as exc:
                report["results"]["errors"].append({"operation": "create_party", "name": party["name"], "error": str(exc)})

        # Attach resolved party/geography IDs to incoming metadata, including IDs of parties created above.
        party_ids = {normalize_name(str(p.get("name") or "")): p.get("id") for p in existing_governance if p.get("id")}
        for person in inserts:
            metadata = person.get("metadata") or {}
            party_name = clean(metadata.get("party_source_name")) or clean(metadata.get("party_short_name"))
            if party_name and not metadata.get("party_governance_id"):
                metadata["party_governance_id"] = party_ids.get(normalize_name(party_name))
            person["metadata"] = metadata
        for existing, patch in updates:
            metadata = patch.get("metadata")
            if isinstance(metadata, dict):
                party_name = clean(metadata.get("party_source_name")) or clean(metadata.get("party_short_name"))
                if party_name and not metadata.get("party_governance_id"):
                    metadata["party_governance_id"] = party_ids.get(normalize_name(party_name))

        # Copy photos into the existing public Storage bucket. Never replace a manually supplied photo.
        for person in inserts:
            source_url = person.get("image_url")
            source_id = str((person.get("metadata") or {}).get("mpsno") or "")
            if source_url and source_id:
                uploaded_url = upload_member_photo(supabase_url, supabase_key, source_url, source_id, person["name"])
                if uploaded_url:
                    person["image_url"] = uploaded_url
                else:
                    person.pop("image_url", None)
        for existing, patch in updates:
            if patch.get("image_url"):
                source_url = patch["image_url"]
                source_id = str(((patch.get("metadata") or {}).get("mpsno")) or "")
                if source_url and source_id:
                    uploaded_url = upload_member_photo(supabase_url, supabase_key, source_url, source_id, existing.get("name") or "member")
                    if uploaded_url:
                        patch["image_url"] = uploaded_url
                    else:
                        patch.pop("image_url", None)

        # Batch inserts, then update matches individually to avoid overwriting concurrent edits.
        # Batch inserts, then update matches individually to avoid overwriting concurrent edits.
        for start in range(0, len(inserts), 100):
            batch = inserts[start:start + 100]
            try:
                supabase_request("POST", rest_url, supabase_key, json=batch, headers={"Prefer": "return=minimal"})
                report["results"]["inserted"] += len(batch)
            except Exception as exc:
                report["results"]["errors"].append({"operation": "insert_batch", "start": start, "count": len(batch), "error": str(exc)})
                # Do not retry blind: an uncertain response could mean the server committed.
                break

        if not report["results"]["errors"]:
            for existing, patch in updates:
                try:
                    supabase_request(
                        "PATCH", rest_url, supabase_key,
                        params={"id": f"eq.{existing['id']}"},
                        json=patch,
                        headers={"Prefer": "return=minimal"},
                    )
                    report["results"]["updated"] += 1
                except Exception as exc:
                    report["results"]["errors"].append({"operation": "update", "id": existing.get("id"), "error": str(exc)})

    try:
        with open(args.report, "w", encoding="utf-8") as handle:
            json.dump(report, handle, ensure_ascii=False, indent=2)
        print(f"Report written to {args.report}")
    except OSError as exc:
        print(f"WARNING: could not write report file: {exc}", file=sys.stderr)

    if report["results"]["errors"]:
        print(f"Completed with {len(report['results']['errors'])} error(s).", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
