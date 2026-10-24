# Engineering code health checks

The **Engineering Code Health** workflow is the automated analysis pipeline for the Citizen Action codebase.

## When it runs

- On pushes to `main`, `feature/**`, and `feat/**` when relevant source changes.
- On pull requests targeting `main`.
- Weekly on Sunday at 06:00 UTC (11:30 India Standard Time).
- Manually through **GitHub → Actions → Engineering Code Health → Run workflow**.

It does not run every day on a timer. Event-based runs happen only when code is pushed or a pull request is updated; the weekly schedule is an additional baseline scan. GitHub schedules run on the default branch, so the scheduled run follows the workflow definition on the repository's default branch.

## Checks

- **Knip** looks for unused files, exports, dependencies, and configuration candidates.
- **jscpd** detects duplicated code.
- **dependency-cruiser** records module dependencies and reports findings under its configured/default rules.
- Reports are uploaded as a 90-day GitHub Actions artifact and a concise summary is written to the Actions run summary.

The checks currently collect findings without failing the entire workflow solely because findings exist. This avoids blocking unrelated work while we establish a baseline and review false positives. Tool installation, build, or report generation problems should be reviewed in the workflow logs.

## Viewing results

Open the repository's [Engineering Code Health workflow runs](https://github.com/kidave/citizenaction/actions/workflows/engineering-code-health.yml). Open a run to see its summary, then download the `engineering-code-health-<commit>` artifact for the detailed JSON reports.

The in-app engineering pages link to these runs. The detailed artifacts remain in GitHub Actions rather than being copied into the application database.

## Local commands

```bash
npx knip
npx jscpd src
npx dependency-cruiser src
npm run build
```

Do not automatically delete or merge code based only on a scanner result. Confirm framework conventions, dynamic usage, side effects, and behavior first.
