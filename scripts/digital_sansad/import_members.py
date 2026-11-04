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
   ¶»§q«^