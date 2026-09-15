# 0006 — Production real-time transport

- Status: Proposed
- Date: 2026-09-12
- Owners: Frontend, backend, platform and security teams

## Context

Dashboards and analytical views require fresh data. The production event sources, directionality, latency target, authorization model and infrastructure are not yet established.

## Proposed decision

Choose transport per use case after measuring requirements. Prefer Server-Sent Events for one-way server updates when supported by the gateway; use WebSockets only for genuine bidirectional low-latency interaction; retain bounded polling as a resilient fallback. Merge events into RTK Query cache or a feature-local buffer based on update rate.

The boilerplate's SSE endpoint is illustrative only.

## Consequences

- Transport is selected by behavior rather than trend.
- Reconnection, ordering, idempotency, authorization and stale-data indicators become first-class requirements.
- High-frequency chart data may need a local buffer rather than global Redux actions.

## Alternatives considered

- WebSockets for every dashboard: not accepted without bidirectional need and operational evidence.
- Fixed polling only: simpler but may miss latency and efficiency targets.

## Verification / follow-up

Capture latency/SLA, concurrent connections, proxy timeouts, event volume, replay behavior, audit needs and fallback expectations; then accept or replace this ADR.
