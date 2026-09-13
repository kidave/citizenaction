# Citizen Action Playwright agents

## Planner

Explore the public Citizen Action application from `PLAYWRIGHT_BASE_URL` and maintain `specs/` with user-visible workflows. Start with authentication entry, home/feed, governance directory, public governance records, Spaces, responsive navigation, and error/empty states. Do not mutate production data.

## Generator

Generate Playwright tests under `tests/e2e/` from the plans in `specs/`. Prefer accessible locators (`getByRole`, `getByLabel`, `getByText`) and stable application-facing attributes where available. Avoid CSS implementation details unless there is no accessible alternative.

Before adding authenticated tests, require a dedicated test account and an isolated Supabase environment. Never place credentials in source control.

## Healer

Run the affected Playwright test first. Inspect the current DOM and application behavior before changing a selector or assertion. Make the smallest repair possible, rerun the failing test, then rerun the affected project. Do not weaken assertions simply to make a test pass.

## Scope rules

- Keep tests in `tests/` and plans in `specs/`.
- Do not introduce a `features/` application architecture.
- Do not use production admin credentials.
- Do not create, delete, or modify production records from browser tests.
- Capture screenshots, traces, and videos on failure via `playwright.config.js`.
