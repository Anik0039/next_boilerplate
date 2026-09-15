# Frontend architecture overview

## Outcome

The frontend is a Next.js App Router application organized by business capability. Atomic Design provides the UI vocabulary, while feature folders own capability-specific data access, models, behavior and composed UI. React Server Components are the default; client components are introduced only for browser APIs, interaction, providers or client state.

## Structural model

```text
app/routes
    ↓ composes
features/<capability>
    ↓ may use
shared components (templates → organisms → molecules → atoms → ui)
    ↓ may use
shared lib, security and configuration
```

Shared layers must never import a feature. Features should communicate through stable public exports or application-level orchestration, not deep imports into another feature.

## Runtime responsibilities

| Area             | Responsibility                                                                         |
| ---------------- | -------------------------------------------------------------------------------------- |
| `src/app`        | Routing, layouts, route handlers, page-level composition and error/loading boundaries  |
| `src/features`   | Business-capability contracts, API endpoints, client state and capability UI           |
| `src/components` | Reusable visual vocabulary with no capability ownership                                |
| `src/providers`  | Explicit composition of unavoidable application-wide client contexts                   |
| `src/store`      | Redux store, shared UI state and RTK Query base API                                    |
| `src/security`   | Client request-integrity support, server security controls and reviewed escape hatches |
| `src/lib`        | Small framework-independent utilities                                                  |

## Example vertical slice

The Accounts example demonstrates:

1. A Zod runtime contract in `features/accounts/model`.
2. RTK Query endpoints and a Server-Sent Events cache update in `features/accounts/api`.
3. A feature-owned organism in `features/accounts/ui`.
4. Shared atoms and molecules used for presentation.
5. Page-level composition in `app/page.tsx`.

The API and data are placeholders. They do not assert the final CIB backend route, account schema, authorization model or real-time transport.

The Payments model demonstrates integer minor-unit limits, recent UMS step-up requirements and maker-checker state rules. It is a policy reference, not a substitute for authoritative backend enforcement.

## Rendering guidance

- Prefer Server Components for pages and read-only composition.
- Add `"use client"` at the smallest interactive boundary.
- Never import server secrets, privileged SDKs or database clients into client-reachable modules.
- Use route handlers/BFF endpoints when server mediation is required; do not treat Next.js as an authorization boundary by itself.
- Validate untrusted data at system boundaries, even when TypeScript types exist.
- Place financial mutations under `/api/bff/*` so the global origin, CSRF, idempotency and replay-header guard applies; route handlers must also consume nonces and idempotency keys through shared production stores.

## Atomic Design adaptation

The inspected reference structure was useful for shared UI consistency. For a large banking surface, placing all organisms in one global directory would weaken ownership. Therefore:

- generic atoms, molecules and templates live under `src/components`;
- capability-specific organisms live under their feature;
- a feature may also have private `atoms`, `molecules` or `organisms` when they are not genuinely reusable;
- promotion to shared components requires demonstrated cross-capability use and neutral naming.
