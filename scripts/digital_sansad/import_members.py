#!/usr/bin/env python3
"""Import Lok Sabha members and current-term appointments from Digital Sansad.

Safe by default: run without --apply to preview. Constituency and term are
stored relationally on position_appointment, not duplicated in person metadata.
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
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

API_URL = "https://sansad.in/api_ls/member"
SOURCE_URL = "https://sansad.in/ls/members"
DEFAULT_PAGE_SIZE = 100
CURRENT_LOK_SABHA_TERM = "18th Lok Sabha"
CURRENT_TERM_START = "2024-06-24"
PAGE_PAUSE_SECONDS = 0.35
SOURCE_RETRY_TOTAL = 5
SOURCE_BACKOFF_FACTOR = 1.5
HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
    "Referer": SOURCE_URL,
    "User-Agent": "CitizenActionDataImporter/1.0 (public civic data; contact via repository)",
}
# Keep this list intentionally limited to public biographical/professional fields.
PERSONAL_FIELDS = {
    "name", "image_url", "birth_date", "date_of_death",
    "phone", "email", "gender", "marital_status", "metadata", "source_system", "source_id"
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


def normalize_marital_status(value: Any) -> str | None:
    """Map source wording to the existing person.marital_status enum."""
    value = normalize_name(clean(value) or "")
    aliases = {
        "single": "single",
        "unmarried": "single",
        "never married": "single",
        "married": "married",
        "divorced": "divorced",
        "widowed": "widowed",
        "widow": "widowed",
        "widower": "widowed",
        "separated": "separated",
    }
    return aliases.get(value)

def normalize_gender(value: Any) -> str | None:
    """Normalize only supported gender values; unknown stays null."""
    normalized = clean(value)
    if not normalized:
        return None
    normalized = normalized.casefold()
    return normalized if normalized in {"male", "female", "other"} else None


def normalize_contact_values(*values: Any) -> list[str]:
    """Collect distinct public contact values without losing multi-value fields."""
    result: list[str] = []
    for value in values:
        items = value if isinstance(value, list) else [value]
        for item in items:
            if isinstance(item, dict):
                item = first(item, "value", "email", "phone", "number", "address")
            cleaned = clean(item)
            if cleaned:
                for part in re.split(r"[;,\n]+", cleaned):
                    normalized = part.strip()
                    if normalized and normalized not in result:
                        result.append(normalized)
    return result


def clean_profile_text(value: Any) -> str | None:
    """Flatten a single public qualification statement without guessing."""
    if isinstance(value, list):
        parts = [clean_profile_text(item) for item in value]
        return "; ".join(part for part in parts if part) or None
    if isinstance(value, dict):
        parts = []
        for key in ("degree", "qualification", "course", "institution", "university", "school", "field", "name", "title", "description"):
            part = clean(value.get(key))
            if part and part not in parts:
                parts.append(part)
        return ", ".join(parts) or None
    return clean(value)


def normalize_professions(*values: Any) -> list[dict[str, str]]:
    """Normalize one or more source professions into canonical metadata records."""
    result: list[dict[str, str]] = []
    for value in values:
        items = value if isinstance(value, list) else [value]
        for item in items:
            if isinstance(item, dict):
                title = clean(first(item, "title", "profession", "occupation", "name", "description"))
            else:
                title = clean(item)
            if title:
                for part in re.split(r"\s*[;|]\s*", title):
                    normalized = part.strip()
                    entry = {"title": normalized}
                    if normalized and entry not in result:
                        result.append(entry)
    return result


def normalize_education(value: Any) -> list[dict[str, Any]]:
    """Preserve multiple qualifications as structured metadata without inventing details."""
    if value is None or value == "":
        return []
    items = value if isinstance(value, list) else [value]
    result: list[dict[str, Any]] = []
    aliases = {
        "qualification": ("qualification", "degree", "course", "title", "name"),
        "field": ("field", "subject", "specialization", "stream"),
        "institution": ("institution", "university", "school", "college"),
        "year": ("year", "graduationYear", "passingYear", "completionYear"),
    }
    for item in items:
        if isinstance(item, dict):
            entry = {}
            for target, keys in aliases.items():
                val = clean(first(item, *keys))
                if val:
                    entry[target] = val
            if entry and entry not in result:
                result.append(entry)
        else:
            val = clean(item)
            entry = {"qualification": val} if val else None
            if entry and entry not in result:
                result.append(entry)
    return result


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


def fetch_all_members(
    page_size: int,
    max_pages: int,
    timeout: int,
    limit_records: int | None = None,
    member_id: str | None = None,
) -> tuple[list[dict[str, Any]], int | None]:
    session = requests.Session()
    # Digital Sansad occasionally stalls mid-pagination. Retry safe GET requests
    # for transient network errors and throttling/server failures, with backoff.
    retry = Retry(
        total=SOURCE_RETRY_TOTAL,
        connect=SOURCE_RETRY_TOTAL,
        read=SOURCE_RETRY_TOTAL,
        status=SOURCE_RETRY_TOTAL,
        backoff_factor=SOURCE_BACKOFF_FACTOR,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET"}),
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
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

        if member_id:
            matches = [row for row in page_records if source_identity(row) == member_id]
            if matches:
                members.extend(matches)
                print(f"Found Digital Sansad mpsno {member_id} on page {page}.")
                break

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

    # Targeted lookups intentionally stop after the page containing the requested ID.
    # The full-list completeness check below does not apply to a one-member lookup.
    if member_id:
        return members, total_elements

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
    }
    source_fields = {
        "noOfTerms": ("noOfTerms", "no_of_terms", "termsServed"),
        "party_source_name": ("partyFname", "partyName", "party"),
        "party": ("party", "partyName", "partyFname"),
        "party_short_name": ("partySname",),
        "party_source_id": ("partyCode", "party_code", "partyId", "party_id"),
        "constituencyCategory": ("constituencyCategory", "constituency_category"),
        "state": ("state", "stateName"),
    }
    for target, keys in source_fields.items():
        value = clean(first(record, *keys))
        if value is not None:
            metadata[target] = value

    person: dict[str, Any] = {"name": name, "slug": slugify(name), "source_system": "sansad", "source_id": mpsno, "metadata": metadata}
    gender = normalize_gender(first(record, "gender", "sex"))
    if gender:
        person["gender"] = gender
    marital_status = normalize_marital_status(first(record, "maritalStatus", "marital_status", "maritalStatusName", "marital"))
    if marital_status:
        person["marital_status"] = marital_status
    if image_url and image_url.startswith(("https://", "http://")):
        person["image_url"] = image_url
    qualification_value = first(record, "qualification", "educationalQualification", "highestQualification")
    qualification_entries = normalize_education(qualification_value)
    education = normalize_education(first(record, "education", "educationDetails", "educationalBackground", "educationalHistory"))
    for entry in reversed(qualification_entries):
        if entry not in education:
            education.insert(0, entry)
    professions = normalize_professions(
        first(record, "profession", "occupation"),
        first(record, "profession2", "otherProfession"),
    )
    birth_date = parse_date(first(record, "birthdate", "birthDate", "dateOfBirth", "dob"))
    date_of_death = parse_date(first(record, "dateOfDeath", "deathDate", "date_of_death"))
    # Person-level contacts must not be inferred from official office contacts.
    phones = normalize_contact_values(first(record, "personalPhone", "phone", "mobile", "mobileNumber", "phoneNumbers", "mobileNumbers"))
    emails = normalize_contact_values(first(record, "personalEmail", "email", "emailAddress", "emailAddresses", "emails"))
    # Scalar columns remain the primary contact for legacy UI; metadata preserves all values.
    phone = phones[0] if phones else None
    email = emails[0] if emails else None
    if phones:
        metadata["phones"] = phones
    if emails:
        metadata["emails"] = emails
    if education:
        metadata["education"] = education
    if professions:
        metadata["professions"] = professions
    person["metadata"] = metadata
    if birth_date:
        person["birth_date"] = birth_date
    if date_of_death:
        person["date_of_death"] = date_of_death
    if phone:
        person["phone"] = phone
    if email:
        person["email"] = email
    return person


def group_rows_by_insert_shape(rows: list[dict[str, Any]]) -> list[list[dict[str, Any]]]:
    """Group rows by their populated columns for PostgREST bulk inserts.

    PostgREST requires every object in a bulk insert payload to have the same
    keys. Keep omitted optional columns omitted so database defaults still apply.
    """
    groups: dict[tuple[str, ...], list[dict[str, Any]]] = {}
    for row in rows:
        shape = tuple(sorted(row))
        groups.setdefault(shape, []).append(row)
    return list(groups.values())


def should_upload_source_photo(existing_person: dict[str, Any] | None, source_url: str | None) -> bool:
    """Upload official photos when absent or still pointing at Digital Sansad.

    Never replace a non-empty, non-Digital-Sansad URL: it may be a manually
    curated image. Governance Storage URLs are left untouched on reruns.
    """
    if not source_url:
        return False
    if not existing_person:
        return True
    current_url = clean(existing_person.get("image_url"))
    if not current_url:
        return True
    if "/storage/v1/object/public/governance/person/" in current_url:
        return False
    return current_url.startswith(("https://sansad.in/", "http://sansad.in/"))


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


def fetch_existing_people(base_url: str, key: str, allow_legacy_schema: bool = False) -> list[dict[str, Any]]:
    url = base_url.rstrip("/") + "/rest/v1/person"
    people: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    select_fields = "id,name,slug,metadata,image_url,qualification,education,profession,birth_date,date_of_death,phone,email,gender,marital_status,source_system,source_id"
    while True:
        try:
            response = supabase_request(
                "GET", url, key,
                params={"select": select_fields, "limit": page_size, "offset": offset},
                headers={"Range-Unit": "items", "Range": f"{offset}-{offset + page_size - 1}"},
            )
        except RuntimeError as error:
            message = str(error).lower()
            missing_new_columns = any(column in message for column in ("gender", "marital_status", "source_system", "source_id")) and (
                "column" in message or "schema cache" in message or "does not exist" in message
            )
            if not allow_legacy_schema or offset != 0 or not missing_new_columns:
                raise
            print("WARNING: Supabase person schema lacks gender/marital_status; dry-run is using legacy columns.", file=sys.stderr)
            select_fields = "id,name,slug,metadata,image_url,qualification,education,profession,birth_date,date_of_death,phone,email"
            response = supabase_request(
                "GET", url, key,
                params={"select": select_fields, "limit": page_size, "offset": offset},
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


def unique_slug(base_slug: str, reserved_slugs: set[str]) -> str:
    """Return a name-based slug, adding -2, -3, etc. only when needed."""
    base = base_slug or "person"
    if base not in reserved_slugs:
        reserved_slugs.add(base)
        return base
    suffix = 2
    while f"{base}-{suffix}" in reserved_slugs:
        suffix += 1
    result = f"{base}-{suffix}"
    reserved_slugs.add(result)
    return result


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


def person_photo_storage_path(person_id: str, extension: str) -> str:
    """Return the canonical object path used by governance person image uploads."""
    return f"person/{person_id}.{extension}"


def upload_member_photo(base_url: str, key: str, source_url: str, person_id: str, source_id: str, name: str) -> str | None:
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
        # Match GovernancePersonSheet: bucket=governance, object=person/<database-person-uuid>.<ext>.
        path = person_photo_storage_path(person_id, extension)
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


def is_constituency_applicable(record: dict[str, Any], label: str | None) -> bool:
    """Return false for genuinely absent/nominated-member constituency values."""
    nominated = normalize_name(str(first(record, "isNominated", "is_nominated", "nominated") or ""))
    if nominated in {"true", "yes", "1", "y"}:
        return False
    if not label:
        return False
    return normalize_name(label) not in {
        "", "nominated", "nominated member", "not applicable", "not available",
        "none", "nil", "na", "n a", "no constituency", "independent nominated", "dash",
    }


def resolve_geography(
    name: str | None,
    geographies: list[dict[str, Any]],
) -> tuple[str | None, bool, str | None]:
    """Resolve a label only when all canonical/alias matches identify one geography."""
    if not name:
        return None, False, None

    def geography_key(value: Any) -> str:
        # Treat ampersand and the word "and" as equivalent without dropping
        # meaningful words from a constituency name.
        return normalize_name(str(value).replace("&", " and "))

    keys = {geography_key(name)}
    # Abbreviations are expanded to "district"; the word is never discarded.
    keys.update({
        re.sub(r"\b(?:distt|dist|zila)\b", "district", key)
        for key in tuple(keys)
    })
    matches = []
    for geography in geographies:
        labels = [
            geography.get("name"),
            geography.get("official_name"),
            str(geography.get("slug") or "").replace("-", " "),
            *(geography.get("other_names") or []),
        ]
        if any(clean(label) and geography_key(label) in keys for label in labels):
            matches.append(geography)
    # A canonical-name/alias collision is just as ambiguous as alias/alias collision.
    # Do not silently prefer the canonical label: require admins to fix the conflict.
    if len(matches) != 1:
        return None, len(matches) > 1, None
    geography = matches[0]
    return str(geography["id"]), False, clean(geography.get("status")) or "active"


def extract_lok_sabha_terms(record: dict[str, Any]) -> list[str]:
    """Parse every explicit Lok Sabha term in a source field such as '7,10,11'."""
    value = clean(first(record, "term", "lokSabhaTerm", "loksabhaTerm", "loksabha", "lsExpr", "ls_expr", "lokSabhaExperience"))
    if not value:
        return []
    matches = re.findall(r"\b(\d{1,2})(?:st|nd|rd|th)?\s*(?:lok\s*sabha)?\b", value, flags=re.IGNORECASE)
    numbers = list(dict.fromkeys(int(item) for item in matches if 1 <= int(item) <= 20))
    terms = []
    for number in numbers:
        suffix = "th" if 11 <= number % 100 <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(number % 10, "th")
        terms.append(f"{number}{suffix} Lok Sabha")
    return terms


def extract_lok_sabha_term(record: dict[str, Any]) -> str | None:
    """Backward-compatible single-term helper; returns None when multiple terms are listed."""
    terms = extract_lok_sabha_terms(record)
    return terms[0] if len(terms) == 1 else None


def is_current_lok_sabha_term(record: dict[str, Any]) -> bool:
    """Classify current membership from explicit 18th-term evidence and source status."""
    source_status = normalize_name(str(first(record, "status", "memberStatus", "appointmentStatus") or ""))
    if source_status in {"former", "former member", "resigned", "ceased", "expired", "term completed", "retired"}:
        return False
    return CURRENT_LOK_SABHA_TERM in extract_lok_sabha_terms(record)


def appointment_dates_from_source(record: dict[str, Any], term: str | None) -> tuple[str | None, str | None]:
    started_at = parse_date(first(record, "startedAt", "startDate", "termStartDate", "dateOfElection", "electionDate", "appointmentDate"))
    ended_at = parse_date(first(record, "endedAt", "endDate", "termEndDate", "dateOfLeaving", "cessationDate", "resignationDate"))
    # Do not substitute the institutional term start for an individual's
    # appointment date. The canonical governance_term row provides term dates.
    return started_at, ended_at


def appointment_status_from_source(record: dict[str, Any], current_term_eligible: bool) -> str:
    """Normalize known statuses while preserving other source-provided statuses."""
    raw_status = clean(first(record, "status", "memberStatus", "appointmentStatus"))
    status_key = normalize_name(raw_status or "")
    known_statuses = {
        "active": "sitting",
        "current": "sitting",
        "currently serving": "sitting",
        "sitting member": "sitting",
        "member": "sitting",
        "sitting": "sitting",
        "suspended": "suspended",
        "resigned": "resigned",
        "former": "former",
        "former member": "former",
        "vacant": "vacant",
    }
    if status_key in known_statuses:
        return known_statuses[status_key]
    return raw_status or ("sitting" if current_term_eligible else "unknown")


def appointment_fields_from_source(
    record: dict[str, Any],
    current_term_eligible: bool,
    term_override: str | None = None,
) -> dict[str, Any]:
    """Extract appointment fields for one explicitly parsed term."""
    term = term_override if term_override is not None else extract_lok_sabha_term(record)
    started_at, ended_at = appointment_dates_from_source(record, term)
    status = appointment_status_from_source(record, current_term_eligible)
    if ended_at and status == "sitting":
        status = "former"
    if term != CURRENT_LOK_SABHA_TERM and status == "sitting":
        status = "former"
    return {
        "term": term,
        "started_at": started_at,
        "ended_at": ended_at,
        "appointment_status": status,
        "official_phone": clean(first(record, "officialPhone", "officePhone", "phone", "telephone", "contactNumber")),
        "official_email": clean(first(record, "officialEmail", "officeEmail", "email", "emailAddress")),
    }


def find_lok_sabha_governance(
    governance: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Return Parliament of India and only the Lok Sabha records parented to it."""
    parliaments = [
        row for row in governance
        if normalize_name(str(row.get("name") or "")) == "parliament of india"
    ]
    parliament = parliaments[0] if len(parliaments) == 1 else None
    houses = [
        row for row in governance
        if row.get("type") in {"legislature", "legislature_house"}
        and normalize_name(str(row.get("name") or "")) == "lok sabha"
        and parliament is not None
        and str(row.get("parent_entity_id") or "") == str(parliament.get("id") or "")
    ]
    return parliaments, houses


def resolve_party(
    name: str | None,
    parties: list[dict[str, Any]],
    source_id: str | None = None,
) -> tuple[dict[str, Any] | None, bool]:
    """Prefer the external source identity; use exact normalized labels as a fallback."""
    candidates = [p for p in parties if str(p.get("type") or "") == "political_party"]
    if source_id:
        source_matches = [
            p for p in candidates
            if p.get("source_system") == "digital_sansad"
            and clean(p.get("source_id")) == source_id
        ]
        if len(source_matches) == 1:
            return source_matches[0], False
        if len(source_matches) > 1:
            return None, True
    if not name:
        return None, False
    key = normalize_name(name)
    matches = [p for p in candidates if key in {
        normalize_name(str(p.get("name") or "")),
        normalize_name(str(p.get("short_name") or "")),
        normalize_name(str(p.get("slug") or "").replace("-", " ")),
    }]
    if source_id and any(
        p.get("source_system") == "digital_sansad"
        and clean(p.get("source_id"))
        and clean(p.get("source_id")) != source_id
        for p in matches
    ):
        # A conflicting source identifier is not safe to override with a name match.
        return None, True
    return (matches[0], False) if len(matches) == 1 else (None, len(matches) > 1)



def merge_missing(existing: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    """Only enrich blanks and merge the importer-owned metadata keys."""
    patch: dict[str, Any] = {}
    for field in ("image_url", "birth_date", "date_of_death", "phone", "email", "gender", "marital_status", "source_system", "source_id"):
        if not existing.get(field) and incoming.get(field):
            patch[field] = incoming[field]

    old_metadata = existing.get("metadata") if isinstance(existing.get("metadata"), dict) else {}
    new_metadata = incoming.get("metadata") or {}
    merged = dict(old_metadata)

    # Fold legacy scalar columns into metadata so metadata becomes canonical.
    legacy_qualification = clean_profile_text(existing.get("qualification"))
    legacy_education = normalize_education(existing.get("education"))
    if legacy_qualification:
        entry = {"qualification": legacy_qualification}
        if entry not in legacy_education:
            legacy_education.insert(0, entry)
    current_education = normalize_education(merged.get("education"))
    for entry in legacy_education:
        if entry not in current_education:
            current_education.append(entry)
    if current_education:
        merged["education"] = current_education

    legacy_professions = normalize_professions(existing.get("profession"))
    current_professions = normalize_professions(merged.get("professions"))
    for entry in legacy_professions:
        if entry not in current_professions:
            current_professions.append(entry)
    if current_professions:
        merged["professions"] = current_professions

    # Preserve unrelated/user-created metadata. Update only fields this importer owns.
    for key, value in new_metadata.items():
        if key in {"official_source", "official_source_url", "noOfTerms",
                   "party", "party_short_name", "party_source_name", "constituencyCategory", "state", "party_governance_id", "party_source_id"}:
            if value is not None:
                merged[key] = value
        elif key in {"phones", "emails"} and value is not None:
            combined = normalize_contact_values(merged.get(key), value)
            if combined:
                merged[key] = combined
        elif key == "education" and value is not None:
            combined = normalize_education(merged.get("education"))
            for entry in normalize_education(value):
                if entry not in combined:
                    combined.append(entry)
            merged[key] = combined
        elif key == "professions" and value is not None:
            combined = normalize_professions(merged.get("professions"))
            for entry in normalize_professions(value):
                if entry not in combined:
                    combined.append(entry)
            merged[key] = combined
    # Convert recognized legacy gender metadata to the canonical column; never guess unsupported values.
    legacy_gender = normalize_gender(merged.get("gender"))
    if legacy_gender:
        if not existing.get("gender") and not patch.get("gender"):
            patch["gender"] = legacy_gender
        merged.pop("gender", None)
    # Remove the legacy duplicate once the canonical Sansad identity is present.
    if clean(incoming.get("source_system") or existing.get("source_system")) == "sansad" and clean(incoming.get("source_id") or existing.get("source_id")):
        merged.pop("mpsno", None)
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
    parser.add_argument("--member-id", default=None,
                        help="Process exactly one Digital Sansad mpsno (fetches the source listing, then selects that member). Cannot be combined with --limit-records.")
    parser.add_argument("--min-source-records", type=int, default=400,
                        help="Fail closed if fewer source rows are returned (current Lok Sabha has roughly 543 seats; API totals are also checked).")
    parser.add_argument("--timeout", type=int, default=60,
                        help="Per-request timeout in seconds for the public source API (default: 60).")
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
        if args.member_id and args.limit_records is not None:
            raise ValueError("--member-id cannot be combined with --limit-records.")
        requested_id = clean(args.member_id)
        source_rows, advertised_total = fetch_all_members(
            args.page_size, args.max_pages, args.timeout, args.limit_records, requested_id
        )
        if requested_id:
            matches = [row for row in source_rows if source_identity(row) == requested_id]
            if len(matches) != 1:
                raise ValueError(
                    f"--member-id {requested_id!r} matched {len(matches)} source rows; "
                    "refusing to continue unless exactly one member is found."
                )
            source_rows = matches
    except Exception as exc:
        print(f"ERROR fetching Digital Sansad: {exc}", file=sys.stderr)
        return 1

    if args.limit_records is None and not args.member_id and len(source_rows) < args.min_source_records:
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
        source_id = person["source_id"]
        # Duplicate source IDs collapse to one person; prefer the record with more fields.
        current = source_people.get(source_id)
        if current is None or len(person) > len(current):
            source_people[source_id] = person

    if not source_people:
        print("ERROR: no usable member records with stable source IDs were found.", file=sys.stderr)
        return 1

    source_constituencies: dict[str, str] = {}
    current_term_eligible: dict[str, bool] = {}
    source_record_by_id: dict[str, dict[str, Any]] = {}
    for row in source_rows:
        source_id = source_identity(row)
        constituency = clean(first(row, "constituency", "constituencyName", "constName"))
        if not is_constituency_applicable(row, constituency):
            constituency = None
        # Generic statuses such as "active" are not enough to infer a current term.
        current_term_eligible[source_id] = is_current_lok_sabha_term(row)
        if source_id:
            # Keep the record associated with the current source ID for appointment fields.
            # The processing loop below must not accidentally reuse the previous loop's row.
            source_record_by_id[source_id] = row
        if source_id and constituency:
            source_constituencies[source_id] = constituency

    existing_people: list[dict[str, Any]] = []
    existing_geographies: list[dict[str, Any]] = []
    existing_governance: list[dict[str, Any]] = []
    existing_positions: list[dict[str, Any]] = []
    existing_appointments: list[dict[str, Any]] = []
    existing_terms: list[dict[str, Any]] = []
    if supabase_url and supabase_key:
        try:
            existing_people = fetch_existing_people(supabase_url, supabase_key, allow_legacy_schema=not args.apply)
            existing_geographies = fetch_rest_rows(supabase_url, supabase_key, "geographies", "id,name,official_name,slug,other_names,status,geography_type,boundary_category", {"geography_type": "eq.parliamentary_constituency", "boundary_category": "eq.political"})
            existing_governance = fetch_rest_rows(supabase_url, supabase_key, "governance", "id,name,short_name,slug,type,parent_entity_id,metadata,source_system,source_id")
            existing_positions = fetch_rest_rows(supabase_url, supabase_key, "position", "id,name,slug,governance_id,appointing_organization_id,geography_id,metadata")
            existing_appointments = fetch_rest_rows(supabase_url, supabase_key, "position_appointment", "id,position_id,person_id,organization_id,term,term_id,status,started_at,ended_at,geography_id,official_phone,official_email,metadata")
            existing_terms = fetch_rest_rows(supabase_url, supabase_key, "governance_term", "id,governance_id,name,started_at,ended_at")
        except Exception as exc:
            print(
                "ERROR reading Supabase prerequisites: verify the schema and apply "
                "20261030183000_position_appointment_term.sql and "
                "20261030190000_position_governance_id_and_scoped_slug.sql before running "
                "the importer (including dry-run). Details: " + str(exc),
                file=sys.stderr,
            )
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
        source_id = clean(existing.get("source_id"))
        if source_id and existing.get("source_system") == "sansad":
            by_source_id[source_id] = existing
        elif metadata.get("official_source") == "Digital Sansad":
            legacy_id = clean(metadata.get("mpsno"))
            if legacy_id:
                by_source_id.setdefault(legacy_id, existing)
        name = clean(existing.get("name"))
        if name:
            by_name[normalize_name(name)].append(existing)

    inserts: list[dict[str, Any]] = []
    reserved_person_slugs = {
        clean(person.get("slug")) for person in existing_people if clean(person.get("slug"))
    }
    unresolved_constituencies: list[dict[str, Any]] = []
    unresolved_parties: list[dict[str, Any]] = []
    ambiguous_constituencies: list[dict[str, Any]] = []
    matched_former_constituencies: list[dict[str, Any]] = []
    matched_defunct_constituencies: list[dict[str, Any]] = []
    ambiguous_parties: list[dict[str, Any]] = []
    party_to_create: dict[str, dict[str, Any]] = {}
    party_identity_updates: dict[str, dict[str, Any]] = {}
    updates: list[tuple[dict[str, Any], dict[str, Any]]] = []
    ambiguous: list[dict[str, Any]] = []
    matched_existing = 0
    resolved_constituencies: dict[str, str] = {}
    appointment_candidates: list[dict[str, Any]] = []

    for source_id, incoming in source_people.items():
        source_record = source_record_by_id.get(source_id, {})
        source_meta = incoming.get("metadata") or {}
        constituency_name = source_constituencies.get(source_id)
        geography_id, geography_ambiguous, geography_status = resolve_geography(constituency_name, existing_geographies)
        if geography_id:
            resolved_constituencies[source_id] = geography_id
            if geography_status == "former":
                matched_former_constituencies.append({
                    "mpsno": source_id, "name": incoming["name"],
                    "constituency": constituency_name, "geography_id": geography_id,
                })
            elif geography_status == "defunct":
                matched_defunct_constituencies.append({
                    "mpsno": source_id, "name": incoming["name"],
                    "constituency": constituency_name, "geography_id": geography_id,
                })
        elif constituency_name:
            item = {"mpsno": source_id, "name": incoming["name"], "constituency": constituency_name}
            (ambiguous_constituencies if geography_ambiguous else unresolved_constituencies).append(item)

        party_name = clean(source_meta.get("party_source_name")) or clean(source_meta.get("party_short_name"))
        party_source_id = clean(source_meta.get("party_source_id"))
        party, party_ambiguous = resolve_party(party_name, existing_governance, party_source_id)
        if party:
            source_meta["party_governance_id"] = party["id"]
            if party_source_id and not party.get("source_id") and not party.get("source_system"):
                party_identity_updates[str(party["id"])] = {
                    "id": party["id"], "source_system": "digital_sansad", "source_id": party_source_id,
                }
        elif party_name and not party_ambiguous:
            party_key = normalize_name(party_name)
            if party_key:
                party_key_for_create = f"source:{party_source_id}" if party_source_id else f"name:{party_key}"
                party_to_create.setdefault(party_key_for_create, {
                    "name": party_name, "slug": slugify(party_name), "type": "political_party",
                    "short_name": clean(source_meta.get("party_short_name")),
                    "source_system": "digital_sansad" if party_source_id else None,
                    "source_id": party_source_id,
                    "metadata": {
                        "official_source": "Digital Sansad", "party_name": party_name,
                        "party_short_name": clean(source_meta.get("party_short_name")),
                    },
                })
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

        source_terms = extract_lok_sabha_terms(source_record)
        # A source row may list several terms, e.g. "7,10,11". Keep one person
        # but plan one appointment per explicitly listed term.
        terms_to_plan: list[str | None] = source_terms or [None]
        for term in terms_to_plan:
            is_current_term = term == CURRENT_LOK_SABHA_TERM and current_term_eligible.get(source_id, False)
            appointment_fields = appointment_fields_from_source(
                source_record, is_current_term, term_override=term
            )
            # A single row's generic dates may describe only its latest election;
            # never copy them onto every historical term in a multi-term list.
            if len(source_terms) > 1 and term != CURRENT_LOK_SABHA_TERM:
                appointment_fields["started_at"] = None
                appointment_fields["ended_at"] = None
            appointment_candidates.append({
                "mpsno": source_id, "name": incoming["name"],
                "geography_id": resolved_constituencies.get(source_id),
                "constituency": constituency_name, "person_id": existing.get("id") if existing else None,
                "current_term_eligible": is_current_term,
                "party_name": party_name,
                "party_source_id": party_source_id,
                "party_governance_id": party.get("id") if party else None,
                **appointment_fields,
            })
        if existing is None:
            incoming["slug"] = unique_slug(slugify(incoming["name"]), reserved_person_slugs)
            inserts.append(incoming)
            continue
        matched_existing += 1
        patch = merge_missing(existing, incoming)        # Store official identity on a unique exact-name match, while retaining other metadata.
        if patch:
            updates.append((existing, patch))

    parliament_rows, lok_sabha_orgs = find_lok_sabha_governance(existing_governance)
    mp_positions = [p for p in existing_positions if normalize_name(str(p.get("name") or "")) == "member of parliament" and len(lok_sabha_orgs) == 1 and (p.get("governance_id") or p.get("appointing_organization_id")) == lok_sabha_orgs[0].get("id")]
    position_ambiguous = len(parliament_rows) != 1 or len(lok_sabha_orgs) != 1 or len(mp_positions) > 1
    mp_position = mp_positions[0] if len(mp_positions) == 1 else None
    term_rows_by_name = {
        (str(t.get("governance_id") or ""), normalize_name(str(t.get("name") or ""))): t
        for t in existing_terms
    }
    existing_appointment_by_key = {
        (str(a.get("position_id")), str(a.get("person_id")), str(a.get("term") or "")): a
        for a in existing_appointments
    }
    existing_appointment_keys = set(existing_appointment_by_key)
    planned_appointments = []
    planned_geography_updates: list[dict[str, Any]] = []
    skipped_appointments = []
    if position_ambiguous:
        skipped_appointments.append({"reason": "Could not uniquely identify Parliament of India → Lok Sabha → Member of Parliament.", "parliament_matches": len(parliament_rows), "lok_sabha_organization_matches": len(lok_sabha_orgs), "member_of_parliament_position_matches": len(mp_positions)})
    else:
        for candidate in appointment_candidates:
            term = candidate.get("term")
            if not term:
                skipped_appointments.append({"mpsno": candidate["mpsno"], "name": candidate["name"], "constituency": candidate.get("constituency"), "reason": "No valid Lok Sabha term could be parsed from the source; person remains eligible for import."})
                continue
            if candidate.get("constituency") and not candidate.get("geography_id"):
                skipped_appointments.append({"mpsno": candidate["mpsno"], "name": candidate["name"], "constituency": candidate.get("constituency"), "reason": "Constituency unresolved or ambiguous; appointment planned without geography."})
            if candidate.get("person_id") and mp_position:
                appointment_key = (str(mp_position["id"]), str(candidate["person_id"]), str(term))
                existing_appointment = existing_appointment_by_key.get(appointment_key)
                if existing_appointment:
                    # A future run should backfill geography after admins add/fix a
                    # constituency or alias, but never overwrite a chosen geography.
                    if candidate.get("geography_id") and not existing_appointment.get("geography_id"):
                        planned_geography_updates.append({
                            "id": existing_appointment.get("id"),
                            "mpsno": candidate["mpsno"],
                            "name": candidate["name"],
                            "term": term,
                            "geography_id": candidate["geography_id"],
                        })
                    continue
            planned_appointments.append(candidate)

    source_field_specs = {
        "birth_date": (("birthdate", "birthDate", "dateOfBirth", "dob"), lambda person, row: bool(person.get("birth_date"))),
        "date_of_death": (("dateOfDeath", "deathDate", "date_of_death"), lambda person, row: bool(person.get("date_of_death"))),
        "education_qualifications": (("qualification", "educationalQualification", "highestQualification", "education", "educationDetails", "educationalBackground", "educationalHistory"), lambda person, row: bool((person.get("metadata") or {}).get("education"))),
        "professions": (("profession", "occupation", "profession2", "otherProfession"), lambda person, row: bool((person.get("metadata") or {}).get("professions"))),
        "photo_url": (("photoUrl", "photoURL", "imageUrl", "image_url", "photo", "image", "memberPhoto"), lambda person, row: bool(person.get("image_url"))),
        "party_source_id": (("partyCode", "party_code", "partyId", "party_id"), lambda person, row: bool((person.get("metadata") or {}).get("party_source_id"))),
        "lok_sabha_terms": (("noOfTerms", "no_of_terms", "termsServed", "loksabha", "term", "terms"), lambda person, row: bool(extract_lok_sabha_terms(row))),
        "appointment_status": (("status", "memberStatus", "appointmentStatus"), lambda person, row: appointment_status_from_source(row, current_term_eligible.get(clean(person.get("source_id")) or "", False)) != "unknown"),
    }
    field_validation = {}
    for field_name, (source_keys, is_mapped) in source_field_specs.items():
        source_present = 0
        mapped = 0
        for source_id, person in source_people.items():
            row = source_record_by_id.get(source_id, {})
            raw_value = first(row, *source_keys)
            has_value = raw_value not in (None, "", [], {})
            source_present += int(has_value)
            mapped += int(has_value and is_mapped(person, row))
        field_validation[field_name] = {
            "source_present": source_present,
            "mapped": mapped,
            "missing_in_source": len(source_people) - source_present,
            "present_but_unmapped": source_present - mapped,
        }

    source_photo_available = sum(1 for person in source_people.values() if person.get("image_url"))
    planned_photo_uploads = sum(
        1 for source_id, source_record in source_record_by_id.items()
        if (
            (incoming_photo_person := to_person(source_record))
            and should_upload_source_photo(
                by_source_id.get(source_id),
                incoming_photo_person.get("image_url"),
            )
        )
    )
    report = {
        "source": SOURCE_URL,
        "api_url": API_URL,
        "fetched_source_rows": len(source_rows),
        "advertised_source_total": advertised_total,
        "unique_members_with_source_id": len(source_people),
        "field_validation": field_validation,
        "photo_import": {"source_photo_available": source_photo_available, "planned_uploads": planned_photo_uploads, "uploaded": 0, "failed": 0, "failures": [], "mode": "pending" if args.apply else "dry-run-not-uploaded"},
        "rows_without_name_or_stable_id": rejected_rows,
        "existing_people_scanned": len(existing_people),
        "matched_existing_people": matched_existing,
        "planned_inserts": len(inserts),
        "planned_updates": len(updates),
        "ambiguous_name_matches_skipped": ambiguous,
        "unresolved_constituencies": unresolved_constituencies,
        "members_without_constituency_count": sum(1 for source_id in source_people if not source_constituencies.get(source_id)),
        "ambiguous_constituencies": ambiguous_constituencies,
        "matched_former_constituencies": matched_former_constituencies,
        "matched_defunct_constituencies": matched_defunct_constituencies,
        "unresolved_parties": unresolved_parties,
        "ambiguous_parties": ambiguous_parties,
        "planned_party_entities": len(party_to_create),
        "appointment_model": {"positions": [{"position": "Member of Parliament", "governance": "Lok Sabha"}], "term_source": "each explicit source-provided Lok Sabha term parsed independently; term_id is canonical", "status_semantics": {"sitting": "currently serving", "former": "historical service", "suspended": "service status explicitly reported as suspended", "unknown": "source does not establish current status"}},
        "parliament_matches": len(parliament_rows),
        "lok_sabha_organization_matches": len(lok_sabha_orgs),
        "member_of_parliament_position_matches": len(mp_positions),
        "planned_appointments": len(planned_appointments),
        "planned_geography_updates": len(planned_geography_updates),
        "geography_updates": planned_geography_updates,
        "planned_historical_appointments": sum(1 for candidate in planned_appointments if candidate.get("term") != CURRENT_LOK_SABHA_TERM),
        "planned_sitting_appointments": sum(1 for candidate in planned_appointments if candidate.get("current_term_eligible") and candidate.get("appointment_status") == "sitting"),
        # Party listed on this directory row is not term-specific, so don't project it backwards.
        "planned_party_appointments": sum(1 for candidate in appointment_candidates if candidate.get("current_term_eligible") and candidate.get("term") and candidate.get("party_name")),
        "generic_member_fallbacks": sum(1 for candidate in appointment_candidates if candidate.get("current_term_eligible") and candidate.get("term") and candidate.get("party_name")),
        "skipped_appointments": skipped_appointments,
        "mode": "apply" if args.apply else "dry-run",
        "sample_limit_records": args.limit_records,
        "selected_member_id": clean(args.member_id),
        "results": {"inserted": 0, "updated": 0, "errors": []},
    }

    print("\nImport preview")
    print(json.dumps({k: v for k, v in report.items() if k != "ambiguous_name_matches_skipped"}, indent=2, ensure_ascii=False))
    if ambiguous:
        print(f"Ambiguous name matches skipped: {len(ambiguous)} (see report file).")

    if args.apply:
        rest_url = supabase_url.rstrip("/") + "/rest/v1/person"
        governance_url = supabase_url.rstrip("/") + "/rest/v1/governance"
        # Attach source identity to unambiguous existing party matches before creating missing parties.
        for identity_patch in party_identity_updates.values():
            try:
                supabase_request(
                    "PATCH", governance_url, supabase_key,
                    params={"id": f"eq.{identity_patch['id']}"},
                    json={"source_system": identity_patch["source_system"], "source_id": identity_patch["source_id"]},
                    headers={"Prefer": "return=minimal"},
                )
            except Exception as exc:
                report["results"]["errors"].append({
                    "operation": "update_party_source_identity", "id": identity_patch["id"], "error": str(exc),
                })

        # Create unresolved party entities only after the operator explicitly selects --apply.
        # Requires the database enum migration adding governance_type='political_party'.
        for party_key, party in list(party_to_create.items()):
            try:
                slug = party["slug"]
                # Recheck immediately before creation so reruns reuse an existing party.
                current_governance = fetch_rest_rows(
                    supabase_url, supabase_key, "governance",
                    "id,name,short_name,slug,type,metadata,source_system,source_id",
                    {"type": "eq.political_party"},
                )
                existing_match, existing_ambiguous = resolve_party(
                    party.get("name"), current_governance, clean(party.get("source_id"))
                )
                if existing_match:
                    party["id"] = existing_match["id"]
                    party["source_system"] = existing_match.get("source_system")
                    party["source_id"] = existing_match.get("source_id")
                elif existing_ambiguous:
                    raise RuntimeError("Party identity matched multiple existing governance records.")
                else:
                    created = supabase_request("POST", governance_url, supabase_key, json={**party, "status": "active"},
                        headers={"Prefer": "return=representation"})
                    payload = created.json()
                    if isinstance(payload, list) and payload:
                        party["id"] = payload[0].get("id")
                    if not party.get("id"):
                        # Re-read by slug if PostgREST did not return a representation.
                        found = fetch_rest_rows(supabase_url, supabase_key, "governance", "id,name,short_name,slug,type,metadata,source_system,source_id", {"slug": f"eq.{slug}"})
                        if found:
                            party["id"] = found[0]["id"]
                if party.get("id"):
                    existing_governance.append(party)
                else:
                    report["results"]["errors"].append({"operation": "create_party", "name": party["name"], "error": "Created party but could not resolve its ID."})
            except Exception as exc:
                report["results"]["errors"].append({"operation": "create_party", "name": party["name"], "error": str(exc)})

        if report["results"]["errors"]:
            with open(args.report, "w", encoding="utf-8") as handle:
                json.dump(report, handle, ensure_ascii=False, indent=2)
            print(f"ERROR: party setup failed; refusing to import members. See {args.report}.", file=sys.stderr)
            return 1

        # Attach resolved party/geography IDs to incoming metadata, including IDs of parties created above.
        party_ids: dict[str, str] = {}
        for party_row in existing_governance:
            if not party_row.get("id") or str(party_row.get("type") or "") != "political_party":
                continue
            if party_row.get("source_system") == "digital_sansad" and clean(party_row.get("source_id")):
                party_ids[f"source:{clean(party_row.get('source_id'))}"] = str(party_row["id"])
            for party_label in (party_row.get("name"), party_row.get("short_name"), str(party_row.get("slug") or "").replace("-", " ")):
                if clean(party_label):
                    party_ids[f"name:{normalize_name(str(party_label))}"] = str(party_row["id"])
        for person in inserts:
            metadata = person.get("metadata") or {}
            party_name = clean(metadata.get("party_source_name")) or clean(metadata.get("party_short_name"))
            if party_name and not metadata.get("party_governance_id"):
                party_source_id = clean(metadata.get("party_source_id"))
                metadata["party_governance_id"] = (
                    party_ids.get(f"source:{party_source_id}") if party_source_id else None
                ) or party_ids.get(f"name:{normalize_name(party_name)}")
            person["metadata"] = metadata
        for existing, patch in updates:
            metadata = patch.get("metadata")
            if isinstance(metadata, dict):
                party_name = clean(metadata.get("party_source_name")) or clean(metadata.get("party_short_name"))
                if party_name and not metadata.get("party_governance_id"):
                    party_source_id = clean(metadata.get("party_source_id"))
                    metadata["party_governance_id"] = (
                        party_ids.get(f"source:{party_source_id}") if party_source_id else None
                    ) or party_ids.get(f"name:{normalize_name(party_name)}")

        # Keep remote photo URLs out of person inserts/updates. Photos are a slow,
        # resumable enrichment step and must not block parliamentary/party appointments.
        pending_photos: dict[str, str] = {}
        for existing, patch in updates:
            if patch.get("image_url"):
                source_id = clean(patch.get("source_id") or existing.get("source_id") or (patch.get("metadata") or {}).get("mpsno"))
                source_url = patch.get("image_url")
                if source_id and source_url:
                    pending_photos[source_id] = source_url
                # Never persist a remote URL if Storage upload is interrupted.
                patch.pop("image_url", None)

        # Resolve existing records by source identity, including name-matched records
        # that will receive their Digital Sansad identity in this run.
        for existing, patch in updates:
            source_id = clean((patch.get("metadata") or {}).get("mpsno"))
            if source_id and source_id not in by_source_id:
                by_source_id[source_id] = existing

        # Rebuild photo work from the source on every run. This recovers photos for
        # people inserted by a previous cancelled run while preserving manual photos.
        for source_id, source_record in source_record_by_id.items():
            incoming = to_person(source_record)
            source_url = incoming.get("image_url") if incoming else None
            existing = by_source_id.get(source_id)
            if should_upload_source_photo(existing, source_url):
                pending_photos[source_id] = source_url

        # Do not send remote URLs in insert payloads. A failed upload leaves image_url
        # empty and a later run will retry it from the public source.
        for person in inserts:
            person.pop("image_url", None)

        # Backfill only missing parliamentary geography after a future mapping fix.
        # Existing non-null geography is deliberately never overwritten.
        appointment_url = supabase_url.rstrip("/") + "/rest/v1/position_appointment"
        for geography_update in planned_geography_updates:
            if not geography_update.get("id") or not geography_update.get("geography_id"):
                continue
            try:
                updated = supabase_request(
                    "PATCH", appointment_url, supabase_key,
                    params={"id": f"eq.{geography_update['id']}", "geography_id": "is.null"},
                    json={"geography_id": geography_update["geography_id"]},
                    headers={"Prefer": "return=representation"},
                ).json()
                if updated:
                    report["results"].setdefault("geography_updates", 0)
                    report["results"]["geography_updates"] += len(updated) if isinstance(updated, list) else 1
            except Exception as exc:
                report["results"]["errors"].append({
                    "operation": "backfill_appointment_geography",
                    "id": geography_update["id"],
                    "mpsno": geography_update["mpsno"],
                    "term": geography_update["term"],
                    "error": str(exc),
                })

        # PostgREST requires identical JSON keys for every row in a bulk insert.
        # Group by populated columns first, then batch each shape independently.
        # This preserves DB defaults for fields absent from a particular source row.
        insert_offset = 0
        for shape_index, shape_rows in enumerate(group_rows_by_insert_shape(inserts)):
            for batch_offset in range(0, len(shape_rows), 100):
                batch = shape_rows[batch_offset:batch_offset + 100]
                try:
                    supabase_request("POST", rest_url, supabase_key, json=batch, headers={"Prefer": "return=minimal"})
                    report["results"]["inserted"] += len(batch)
                except Exception as exc:
                    report["results"]["errors"].append({
                        "operation": "insert_batch",
                        "shape_group": shape_index,
                        "start": insert_offset + batch_offset,
                        "count": len(batch),
                        "columns": sorted(batch[0]) if batch else [],
                        "error": str(exc),
                    })
                    # Do not retry blind: an uncertain response could mean the server committed.
                    break
            if report["results"]["errors"]:
                break
            insert_offset += len(shape_rows)

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

        party_appointment_candidates = [
            candidate for candidate in appointment_candidates
            if candidate.get("current_term_eligible") and candidate.get("term") and candidate.get("party_name")
        ]
        if not report["results"]["errors"] and (planned_appointments or party_appointment_candidates):
            try:
                refreshed_people = fetch_existing_people(supabase_url, supabase_key)
                source_to_person_id = {}
                for person in refreshed_people:
                    metadata = person.get("metadata") if isinstance(person.get("metadata"), dict) else {}
                    if person.get("source_system") == "sansad" and clean(person.get("source_id")):
                        source_to_person_id[clean(person.get("source_id"))] = person.get("id")
                    elif metadata.get("official_source") == "Digital Sansad" and clean(metadata.get("mpsno")):
                        source_to_person_id.setdefault(clean(metadata.get("mpsno")), person.get("id")
                appointment_url = supabase_url.rstrip("/") + "/rest/v1/position_appointment"
                if planned_appointments and not mp_position:
                    created = supabase_request("POST", supabase_url.rstrip("/") + "/rest/v1/position", supabase_key,
                        json={"name": "Member of Parliament", "slug": "member-of-parliament", "governance_id": lok_sabha_orgs[0]["id"], "metadata": {"official_source": "Digital Sansad", "position_scope": "Lok Sabha member"}},
                        headers={"Prefer": "return=representation"})
                    payload = created.json()
                    mp_position = payload[0] if isinstance(payload, list) and payload else None
                    if not mp_position or not mp_position.get("id"):
                        found = fetch_rest_rows(supabase_url, supabase_key, "position", "id,name,slug,governance_id,appointing_organization_id,geography_id,metadata", {"slug": "eq.member-of-parliament"})
                        found = [p for p in found if (p.get("governance_id") or p.get("appointing_organization_id")) == lok_sabha_orgs[0]["id"]]
                        if len(found) != 1:
                            raise RuntimeError("Could not safely resolve Member of Parliament position after creation.")
                        mp_position = found[0]
                for candidate in planned_appointments:
                    person_id = candidate.get("person_id") or source_to_person_id.get(candidate["mpsno"])
                    if not person_id:
                        report["results"]["errors"].append({"operation": "resolve_appointment_person", "mpsno": candidate["mpsno"], "error": "Could not resolve person ID after import."})
                        continue
                    term = candidate["term"]
                    key = (str(mp_position["id"]), str(person_id), str(term))
                    if key in existing_appointment_keys:
                        continue
                    term_id = term_rows_by_name.get((str(lok_sabha_orgs[0]["id"]), normalize_name(str(term))), {}).get("id")
                    if not term_id:
                        report["results"]["errors"].append({"operation": "resolve_term", "mpsno": candidate["mpsno"], "term": term, "error": "No governance_term row exists for this term under the Lok Sabha governance record; appointment was not written."})
                        continue
                    payload = {"position_id": mp_position["id"], "person_id": person_id, "organization_id": lok_sabha_orgs[0]["id"], "geography_id": candidate.get("geography_id"), "term_id": term_id, "term": term, "status": clean(candidate.get("appointment_status")) or "unknown", "started_at": candidate.get("started_at"), "ended_at": candidate.get("ended_at"), "official_phone": clean(candidate.get("official_phone")), "official_email": clean(candidate.get("official_email")), "metadata": {"official_source": "Digital Sansad", "mpsno": candidate["mpsno"], "source_url": SOURCE_URL, "term_evidence": "Digital Sansad member-list row"}}
                    try:
                        supabase_request("POST", appointment_url, supabase_key, json=payload, headers={"Prefer": "return=minimal"})
                        existing_appointment_keys.add(key)
                        report["results"].setdefault("appointments_created", 0)
                        report["results"]["appointments_created"] += 1
                    except Exception as exc:
                        report["results"]["errors"].append({"operation": "create_appointment", "mpsno": candidate["mpsno"], "name": candidate["name"], "error": str(exc)})

                # Use a generic Member position for party affiliation when no specific office is known.
                current_positions = fetch_rest_rows(
                    supabase_url, supabase_key, "position",
                    "id,name,slug,governance_id,appointing_organization_id,geography_id,metadata",
                )
                party_position_by_governance = {}
                for candidate in party_appointment_candidates:
                    party_name = clean(candidate.get("party_name"))
                    party_id = (
                        party_ids.get(f"source:{clean(candidate.get('party_source_id'))}")
                        if clean(candidate.get("party_source_id")) else None
                    ) or party_ids.get(f"name:{normalize_name(party_name or '')}")
                    if not party_id:
                        report["results"]["errors"].append({
                            "operation": "resolve_party_appointment_governance",
                            "mpsno": candidate["mpsno"], "party": party_name,
                            "error": "Could not resolve a unique political-party governance ID.",
                        })
                        continue
                    party_position = party_position_by_governance.get(party_id)
                    if not party_position:
                        matches = [
                            position for position in current_positions
                            if (position.get("governance_id") or position.get("appointing_organization_id")) == party_id
                            and normalize_name(str(position.get("name") or "")) in {"member", "party member"}
                        ]
                        if len(matches) > 1:
                            report["results"]["errors"].append({
                                "operation": "resolve_party_member_position",
                                "party": party_name,
                                "error": "Multiple Party Member positions exist under this party.",
                            })
                            continue
                        if matches:
                            party_position = matches[0]
                        else:
                            created = supabase_request(
                                "POST", supabase_url.rstrip("/") + "/rest/v1/position", supabase_key,
                                json={
                                    "name": "Member", "slug": "member",
                                    "governance_id": party_id,
                                    "metadata": {"official_source": "Digital Sansad", "position_scope": "political party membership"},
                                },
                                headers={"Prefer": "return=representation"},
                            )
                            payload = created.json()
                            party_position = payload[0] if isinstance(payload, list) and payload else None
                            if not party_position or not party_position.get("id"):
                                found = fetch_rest_rows(
                                    supabase_url, supabase_key, "position",
                                    "id,name,slug,governance_id,appointing_organization_id,geography_id,metadata",
                                    {"slug": "eq.member"},
                                )
                                found = [p for p in found if (p.get("governance_id") or p.get("appointing_organization_id")) == party_id]
                                if len(found) != 1:
                                    raise RuntimeError(f"Could not safely resolve Member position for {party_name}.")
                                party_position = found[0]
                            current_positions.append(party_position)
                        party_position_by_governance[party_id] = party_position

                    person_id = candidate.get("person_id") or source_to_person_id.get(candidate["mpsno"])
                    if not person_id:
                        report["results"]["errors"].append({
                            "operation": "resolve_party_appointment_person",
                            "mpsno": candidate["mpsno"],
                            "error": "Could not resolve person ID after import.",
                        })
                        continue
                    term = candidate["term"]
                    # Party affiliation is a person-to-party relationship, not a parliamentary-term appointment.
                    # Do not assign a term, service dates, or parliamentary status until party history is modeled.
                    key = (str(party_position["id"]), str(person_id), "")
                    if key in existing_appointment_keys:
                        continue
                    payload = {
                        "position_id": party_position["id"], "person_id": person_id,
                        "organization_id": party_id,
                        "geography_id": None,
                        "metadata": {
                            "official_source": "Digital Sansad", "mpsno": candidate["mpsno"],
                            "source_url": SOURCE_URL, "relationship": "party affiliation",
                        },
                    }
                    try:
                        supabase_request("POST", appointment_url, supabase_key, json=payload, headers={"Prefer": "return=minimal"})
                        existing_appointment_keys.add(key)
                        report["results"].setdefault("party_appointments_created", 0)
                        report["results"]["party_appointments_created"] += 1
                    except Exception as exc:
                        report["results"]["errors"].append({
                            "operation": "create_party_appointment", "mpsno": candidate["mpsno"],
                            "name": candidate["name"], "party": party_name, "error": str(exc),
                        })
            except Exception as exc:
                report["results"]["errors"].append({"operation": "prepare_appointments", "error": str(exc)})


        # Photos are deliberately last: slow source downloads must not prevent
        # core person/appointment/party relationships from being completed. This
        # phase is resumable because candidates are rebuilt from source every run.
        if not report["results"]["errors"] and pending_photos:
            try:
                refreshed_people_for_photos = fetch_existing_people(supabase_url, supabase_key)
                people_by_source_id = {
                    clean(person.get("source_id") or (person.get("metadata") or {}).get("mpsno")): person
                    for person in refreshed_people_for_photos
                    if (person.get("source_system") == "sansad" and clean(person.get("source_id"))) or (
                        isinstance(person.get("metadata"), dict)
                        and person["metadata"].get("official_source") == "Digital Sansad"
                        and clean(person["metadata"].get("mpsno"))
                    )
                }
                total_photos = len(pending_photos)
                for photo_index, (source_id, source_url) in enumerate(pending_photos.items(), start=1):
                    person = people_by_source_id.get(source_id)
                    person_id = str(person.get("id") or "") if person else ""
                    if not person_id:
                        report["photo_import"]["failed"] += 1
                        report["photo_import"]["failures"].append({"mpsno": source_id, "reason": "Person UUID could not be resolved for photo upload."})
                        continue
                    if not should_upload_source_photo(person, source_url):
                        report["photo_import"].setdefault("skipped_existing", 0)
                        report["photo_import"]["skipped_existing"] += 1
                        continue
                    uploaded_url = upload_member_photo(
                        supabase_url, supabase_key, source_url, person_id, source_id,
                        person.get("name") or "member",
                    )
                    if not uploaded_url:
                        report["photo_import"]["failed"] += 1
                        report["photo_import"]["failures"].append({"mpsno": source_id, "reason": "Photo download or Storage upload failed."})
                    else:
                        try:
                            supabase_request(
                                "PATCH", rest_url, supabase_key,
                                params={"id": f"eq.{person_id}"},
                                json={"image_url": uploaded_url},
                                headers={"Prefer": "return=minimal"},
                            )
                            report["photo_import"]["uploaded"] += 1
                        except Exception as exc:
                            report["photo_import"]["failed"] += 1
                            report["photo_import"]["failures"].append({"mpsno": source_id, "reason": str(exc)})
                    if photo_index == 1 or photo_index % 25 == 0 or photo_index == total_photos:
                        print(
                            f"Photo recovery progress: {photo_index}/{total_photos} "
                            f"(uploaded={report['photo_import']['uploaded']}, "
                            f"failed={report['photo_import']['failed']})"
                        )
            except Exception as exc:
                report["photo_import"]["failed"] += len(pending_photos)
                report["photo_import"]["failures"].append({"reason": f"Could not resolve people for photo upload: {exc}"})

    if args.apply and report.get("photo_import", {}).get("mode") == "pending":
        photo_report = report["photo_import"]
        photo_report["mode"] = "applied-with-errors" if photo_report.get("failed") or report["results"]["errors"] else "applied"

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