# 0003 — Explicit, minimal provider composition

- Status: Proposed
- Date: 2026-09-12
- Owners: Frontend architecture and frontend team

## Context

Redux, feature flags and future SDKs may require React providers. Uncontrolled providers obscure dependencies and can force large client-rendered subtrees.

## Decision

Compose application-wide providers in `AppProviders`. Add a provider only for an ambient dependency with broad consumers or when required by an adopted library. Prefer capability-local providers for capability-local lifetimes. A provider addition requires review.

## Consequences

- Provider order and client boundaries are visible.
- Context does not become a second informal state store.
- Some route groups may need their own provider composition later.

## Alternatives considered

- Providers added ad hoc in feature components: rejected because lifetime and dependencies become unclear.
- All providers at the root: rejected as a rule because it expands client scope unnecessarily.

## Verification / follow-up

Monitor render boundaries and split provider trees by route group when justified by measurements or lifecycle.
