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
- Never imports personal phone numbers or addresses.
- Does not create appointments or delete records.
- The report records source totals, matches, planned writes, and errors.

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

Preview only:

```powershell
python scripts\digital_sansad\import_members.py --report digital-sansad-import-report.json
```

Write after reviewing the preview:

```powershell
python scripts\digital_sansad\import_members.py --apply --report digital-sansad-import-report.json
```

The service-role key bypasses RLS. Keep it private and use it only in a trusted local shell or GitHub Actions secret. The importer must not be exposed as a public web endpoint.

## GitHub Actions

The scheduled workflow runs weekly and can be triggered manually. It requires repository secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflow uploads its JSON report as an artifact. A scheduled run applies additive/enrichment-only changes; it never deletes records. Before enabling the schedule, run a manual dry-run and inspect the source totals and mapping against the current Digital Sansad API response.
