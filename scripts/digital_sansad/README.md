# Digital Sansad member importer

Imports unique Lok Sabha member records from the official Digital Sansad directory into `public.person`.

Source:
- Directory: https://sansad.in/ls/members
- Public listing API: https://sansad.in/api_ls/member

## Safety model

- Dry-run is the default. Use `--apply` only after reviewing the report.
- Refuses to run if the source returns fewer than 1,000 records by default.
- Uses Digital Sansad's stable `mpsno` identifier when available.
- Exact normalized-name matching is used only when it identifies exactly one existing person. Ambiguous matches are skipped and reported.
- Existing user-entered values are preserved; only missing public profile fields are enriched.
- Profile photos are copied from Digital Sansad into the existing public `governance` Storage bucket at `person/<slug>-<mpsno>/profile.<ext>`; `person.image_url` stores the resulting public Storage URL. Unsupported or failed photos are reported and do not block the member import.
- Member names remain in the existing single `person.name` column. The importer uses the best source display-name field and does not invent expansions for initials. It generates a unique slug using the source member ID.
- Constituencies are resolved only against existing `geographies` rows where `boundary_category = political` and `geography_type = parliamentary_constituency`. Matching checks canonical/official names and slugs first, then the `other_names` array. A defunct geography is still a valid match; its ID is retained exactly like an active geography, and the report separately lists members matched to defunct constituencies. The importer never substitutes a successor constituency or creates geography/boundary records. Unresolved and ambiguous names are reported for review.
- Political parties are resolved against governance entities of type `political_party`, preferring `governance.source_system + source_id` when the member API exposes a party code and falling back to an unambiguous exact normalized name/abbreviation. Missing parties are created with the full source name and short name when available. The internal governance UUID remains the relationship key; no parallel party table is created. External identifiers live in the governance columns added by migration `20261028010000_governance_external_source_identity.sql`.
- Current members are linked through the existing `governance` → `position` → `position_appointment` model. The importer reuses the unique `governance.type = legislature_house` record named Lok Sabha and a single `position.name = Member of Parliament` owned by that house. It stores the term (currently `18th Lok Sabha`) and matched constituency UUID in `position_appointment.term` and `position_appointment.geography_id`; it does not store constituency labels or geography UUIDs in person metadata.
- Only records whose source term field explicitly identifies the 18th Lok Sabha and whose constituency resolves uniquely are eligible for appointments. Generic statuses such as `active` are not enough to infer a current term. Unresolved/ambiguous constituencies and records without explicit term evidence remain in diagnostics and do not receive an appointment. Re-running is idempotent by position + person + term. Dry-run remains the default.
- Apply migration `20261030183000_position_appointment_term.sql` before running with `--apply`. The current-term start is recorded as 2024-06-24 (the first sitting of the 18th Lok Sabha). Historical career appointments are not inferred from the member listing and must be imported only from explicit term-level source data.
- The importer never deletes records.
- The report records source totals, matches, planned writes, and errors.

## Historical and alternate constituency names

The geography admin editor supports a comma-separated list of alternate names and a status of `active` or `defunct`. To import historical members correctly, add a defunct parliamentary constituency as its own geography and preserve its former boundary when available. Add source spellings such as `Belgaum` to the existing geography's alternate names when they refer to the same geography. Do not add a former constituency as an alternate name of its successor: for example, Periyakulam must remain its own defunct geography rather than being aliased to Theni.

The importer matches canonical names before alternate names. If an alias matches more than one geography, it reports the constituency as ambiguous rather than guessing. If a source constituency is not present in geographies, it remains unresolved; the importer does not create a boundary or map it to a current constituency automatically.

## Political-party directory import

The party dataset supplied for this project can be saved as `digital-sansad-parties.json` in the repository root. Importing this dataset is separate from importing members, so parties without a current member are retained too.

Preview without writing:

```powershell
python scripts\digital_sansad\import_parties.py digital-sansad-parties.json --report digital-sansad-party-preview.json
```

After reviewing the report and applying migration `20261028010000_governance_external_source_identity.sql` plus the preceding political-party type migration:

```powershell
python scripts\digital_sansad\import_parties.py digital-sansad-parties.json --apply --report digital-sansad-party-import-report.json
```

The importer stores `party_code` in `governance.source_id` and `digital_sansad` in `governance.source_system`. Citizen Action's generated `governance.id` remains the primary key. Re-running the importer reconciles records by source identity and will not create a second record for an already imported party. Name-based matches are only accepted when unambiguous; unrelated metadata and populated user-managed fields are preserved.

## Local setup (PowerShell)

Run from the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r scripts\digital_sansad\requirements.txt
```

Set these variables in the current PowerShell session (do not commit them):

```powershell
$env:SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "YOUR_SERVICE_ROLE_KEY"
```

Preview the first source row only (not a specific member):

```powershell
python scripts\digital_sansad\import_members.py --limit-records 1 --report digital-sansad-test.json
```

Preview one specific member by Digital Sansad `mpsno` (recommended for a targeted test):

```powershell
python scripts\digital_sansad\import_members.py --member-id 344 --report digital-sansad-member-344.json
```

`--member-id` fetches the source listing and proceeds only if exactly one record has that stable ID. It cannot be combined with `--limit-records`. This is still a dry-run; no Supabase writes occur without `--apply`.

Write after reviewing the preview:

```powershell
python scripts\digital_sansad\import_members.py --apply --report digital-sansad-import-report.json
```

The service-role key bypasses RLS. Keep it private and use it only in a trusted local shell or GitHub Actions secret. The importer must not be exposed as a public web endpoint.

## GitHub Actions

The workflow runs every Sunday at 12:30 IST and performs a **dry-run only**. Manual runs also default to dry-run. A manual run writes to Supabase only when the `apply` input is explicitly set to `true`.

Repository secrets required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Every run uploads its JSON report as an artifact for 90 days. Before enabling automatic writes, first review a full dry-run report, validate the data mappings, run a controlled initial import, and verify idempotency by running the importer again. Only then should the scheduled workflow be changed to apply automatically. The scheduled workflow only runs from the repository's default branch, so it takes effect after this PR is merged.
