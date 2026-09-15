# 0002 — Redux Toolkit and RTK Query

- Status: Proposed
- Date: 2026-09-12
- Owners: Frontend architecture and frontend team

## Context

The application is expected to have many components, dashboards, coordinated workflows and live data. The small team also values predictable conventions and long-lived debugging support. Not all state should be global.

## Decision

Use Redux Toolkit for cross-tree client state and RTK Query for client-side server-state caching. Use typed hooks and a per-render store factory. Continue to use React local state and URL state when their ownership is narrower.

## Consequences

- One established toolset covers global client state and browser-side server cache.
- Redux DevTools and explicit event flow improve diagnosis.
- Boilerplate and discipline are higher than a minimal store.
- Misuse can create unnecessary global state; the ownership guide is mandatory.

## Alternatives considered

- Zustand: attractive for small stores, but not selected for the primary architecture due to the desired conventions, debugging and expected scale.
- TanStack Query plus Redux: not selected initially because RTK Query avoids two overlapping server-state conventions.
- React Context for domain state: rejected due to update granularity and ownership concerns.

## Verification / follow-up

Profile high-frequency dashboard updates. Keep streaming/local visualization state outside Redux if measurements show that to be the safer boundary.
