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
- Constituencies are resolved only against existing `geographies` rows where `boundary_category = political` and `geography_type = parliamentary_constituency`. The resolved geography ID is retained in source metadata for later use by the existing position/appointment model; unresolved and ambiguous names are reported rather than creating duplicate boundaries.
- Political parties are resolved against governance entities of type `political_party`, preferring `governance.source_system + source_id` when the member API exposes a party code and falling back to an unambiguous exact normalized name/abbreviation. Missing parties are created with the full source name and short name when available. The internal governance UUID remains the relationship key; no parallel party table is created. External identifiers live in the governance columns added by migration `20261028010000_governance_external_source_identity.sql`.
- This listing importer does not create career appointments. Career history must use the existing `governance` → `position` → `position_appointment` model. It never deletes records.
- The report records source totals, matches, planned writes, and errors.

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

The scheduled workflow runs a **dry-run only** and can be triggered manually. A manual run writes changes only when the `apply` input is explicitly set to `true`. It requires repository secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow uploads its JSON report as an artifact. A scheduled run applies additive/enrichment-only changes; it never deletes records. Before enabling the schedule, run a manual dry-run and inspect the source totals and mapping against the current Digital Sansad API response.
