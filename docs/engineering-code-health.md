# Engineering code health checks

Citizen Action separates internal source analysis from package dependency/security insights so each tool has one clear responsibility.

## When it runs

- On pushes to `main` when relevant source, tooling, or package files change.
- On pull requests targeting `main` when relevant files change.
- Weekly on Sunday at 06:00 UTC (11:30 India Standard Time).
- Manually through **GitHub → Actions → Engineering Code Health → Run workflow**.

Feature-branch pushes do not trigger an additional standalone run. An open pull request runs checks once for its PR event, avoiding duplicate push/PR runs. The weekly schedule is an additional baseline scan, not a daily job. GitHub scheduled workflows run from the default branch, so the schedule becomes active after the workflow is present on `main`.

## Checks and ownership

- **GitHub Dependency Graph:** third-party package dependency insights. [Open Citizen Action's dependency graph](https://github.com/kidave/citizenaction/network/dependencies).
- **Knip:** potentially unused source files, exports, and dependencies.
- **jscpd:** repeated code blocks, with the largest clone locations summarized in the run report.
- **dependency-cruiser:** internal module dependencies and architecture output. It runs in the separate [Component Architecture Map workflow](https://github.com/kidave/citizenaction/actions/workflows/component-architecture-map.yml), rather than running a second time in code health.

## Reading findings safely

Knip and jscpd findings are candidates for human review, not automatic deletion instructions. Next.js routes, dynamic imports, scripts, generated assets, framework entry points, and intentionally similar UI flows can create false positives or valid duplication. Review call sites, runtime behavior, access-control checks, and side effects before consolidating anything.

The code-health report summarizes Knip's actual `issues` structure and shows the largest duplicate locations. It records tool exit codes separately so a report with findings is not confused with a successful zero-finding scan.

## Viewing results

Open the [Engineering Code Health workflow runs](https://github.com/kidave/citizenaction/actions/workflows/engineering-code-health.yml). Open a run to see the summary, then download its `engineering-code-health-<commit>` artifact for detailed JSON reports.

## Local commands

```bash
npx knip
npx jscpd src
npx dependency-cruiser src
npm run build
```

Findings remain report-only while we establish a trustworthy baseline. Package security scanning and AI tools are deliberately out of scope for this engineering phase.
