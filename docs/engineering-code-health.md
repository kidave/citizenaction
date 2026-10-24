# Engineering code health checks

Citizen Action separates internal source analysis from package dependency/security insights so each tool has one clear responsibility.

## When it runs

- On pushes to `main` when relevant source, tooling, or package files change.
- On pull requests targeting `main` when relevant files change.
- Weekly on Sunday at 06:00 UTC (11:30 India Standard Time).
- Manually through **GitHub → Actions → Engineering Code Health → Run workflow**.

Feature-branch pushes do not trigger an additional standalone run. An open pull request runs the checks once for its PR event, avoiding duplicate push/PR runs. The weekly schedule is an additional baseline scan, not a daily job. GitHub scheduled workflows run from the default branch, so this schedule becomes active after the workflow is present on `main`.

## Checks and ownership

- **GitHub Dependency Graph + Dependabot:** third-party package dependency insights and vulnerability alerts. Citizen Action is public, so GitHub makes the dependency graph available. Open [the repository dependency graph](https://github.com/kidave/citizenaction/network/dependencies).
- **Knip:** unused source files, exports, and dependencies.
- **jscpd:** repeated code blocks.
- **dependency-cruiser:** internal module dependencies and architecture output. It runs in the separate [Component Architecture Map workflow](https://github.com/kidave/citizenaction/actions/workflows/component-architecture-map.yml), rather than running a second time in code health.

## Viewing results

Open the [Engineering Code Health workflow runs](https://github.com/kidave/citizenaction/actions/workflows/engineering-code-health.yml). Open a run to see the summary, then download its `engineering-code-health-<commit>` artifact for the detailed JSON reports.

The in-app engineering pages link to these runs. Detailed reports remain in GitHub Actions artifacts rather than being copied into Supabase.

## Local commands

```bash
npx knip
npx jscpd src
npx dependency-cruiser src
npm run build
```

Do not automatically delete or merge code based only on scanner output. Confirm framework conventions, dynamic usage, side effects, and behavior first. Knip and jscpd currently report findings without blocking the build while the baseline is reviewed.
