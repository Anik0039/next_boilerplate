# 0001 — Capability-oriented structure with Atomic Design

- Status: Proposed
- Date: 2026-09-12
- Owners: Frontend architecture and frontend team

## Context

The inspected CIF frontend has a comprehensible shared Atomic Design hierarchy. The CIB scope, however, spans many large business capabilities. A single global hierarchy would group files by technical shape while scattering each business change across the repository.

## Decision

Organize business behavior under `src/features/<capability>`. Retain Atomic Design for the shared visual language and within a feature where useful. Capability-specific models, API adapters, state and organisms stay together. App Router pages compose features through their public exports.

## Consequences

- Teams can navigate and change one capability with less cross-repository movement.
- Shared UI retains consistent composition rules.
- Some atomic categories may exist inside a feature and globally; ownership rules must be applied consistently.
- Promotion to shared code requires evidence of neutral reuse.

## Alternatives considered

- Global Atomic Design only: rejected because business ownership degrades as the surface grows.
- Capability folders without UI vocabulary: rejected because it weakens design-system consistency.

## Verification / follow-up

Add dependency-boundary linting when feature count grows and review the rules after two production capabilities.
