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
        raise RuntimeError(f"Supabase {method} failed ({respo¶»§q«^