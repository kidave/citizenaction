# Citizen Action — Source of Truth

This file is the compact orientation document for anyone working on the project.

## Authority order

1. **GitHub (`kidave/citizenaction`)** — canonical implementation and development memory.
2. **Supabase (`ward`)** — canonical live database/auth/storage state.
3. **Vercel (`citizenaction`)** — canonical deployment/runtime state.
4. **Chat history and uploaded files** — historical context only; never authoritative when they conflict with the systems above.

## Working rule

Before changing anything, inspect the current repository and the relevant live Supabase/Vercel state. After changing anything, verify it and make the durable change traceable in GitHub.

## Stack

- Next.js 15 / React 19 / Pages Router
- JavaScript/JSX
- Tailwind CSS + shadcn-style/Radix UI
- React Hook Form + Zod
- TanStack Query
- Supabase Postgres/Auth/Storage/RLS/RPCs
- Vercel

## Main domains

- Identity and profiles
- Spaces and membership
- Posts, contributions, attachments and links
- Categories/classification
- Governance directory
- Geography and jurisdiction
- People, positions and appointments

## Database rule

Schema changes should be made through Supabase migrations and then represented in GitHub. Avoid dashboard-only changes that create undocumented schema drift.

## Security rule

Authorization belongs in Supabase RLS/RPC/database checks and server-side boundaries. UI visibility is not authorization. Service-role credentials remain server-only.

## Documentation rule

Update `docs/architecture.md`, `docs/database.md`, `docs/backend.md`, `docs/frontend.md`, `docs/roadmap.md`, or `docs/technical-debt.md` when the corresponding durable project knowledge changes. Do not rely on chat history to remember architectural decisions.

## Current infrastructure

- Supabase project is healthy and located in `ap-south-1`.
- Vercel is connected to GitHub and has a current READY deployment.
- Supabase currently reports `public.spatial_ref_sys` without RLS. This was intentionally not changed automatically because remediation requires appropriate policies for the PostGIS system relation.

## Project principle

> **GitHub tells us what we build. Supabase tells us what data/backend state exists. Vercel tells us what is deployed and running.**
