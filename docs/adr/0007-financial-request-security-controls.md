# 0007 — Financial request and production security controls

- Status: Proposed
- Date: 2026-09-13
- Owners: Frontend architecture, application security and platform teams

## Context

The original browser security baseline described controls but intentionally left request integrity, transaction safety, operational security gates and gateway enforcement open. The backend and UMS/Keycloak integration are still being refactored, so this repository must provide safe boundaries without inventing an identity or entitlement protocol.

## Decision

- Enforce nonce-based CSP in every production runtime. Report-only mode is available only outside production.
- Protect unsafe `/api/bff/*` requests with an exact origin allowlist, Fetch Metadata checks, a signed expiring CSRF token, an idempotency key, a request nonce and a bounded request timestamp.
- Provide atomic-store interfaces for replay and idempotency. Production adapters must use a shared durable store; in-memory implementations are test/reference utilities only.
- Model payment values in integer minor units. Require trusted UMS-derived actor context for step-up freshness and maker-checker separation. Daily consumption and limits come from the authoritative backend.
- Bound and runtime-validate request bodies. Apply no-store policies to sensitive responses and streams.
- Treat application rate limiting as defense in depth. The approved gateway/WAF remains authoritative and must implement `config/security/gateway-policy.json`.
- Emit structured, minimized security events and require the platform to transport them to an access-controlled, tamper-resistant SIEM.
- Gate production release on threat-model approval, deployed WAF evidence, DAST evidence and an independent penetration-test report.
- Make demo APIs impossible to enable when `NODE_ENV=production`, even if `ENABLE_DEMO_API=true` is supplied.

Authentication, session lifecycle and entitlement resolution remain owned by UMS/Keycloak and the backend. No request body, query value or browser-controlled identity header may create `TrustedActorContext`.

## Consequences

- New financial BFF mutations fail closed until CSRF and trusted-origin settings are configured.
- Retries can safely return an idempotently stored response once a production distributed adapter is connected.
- Security controls are visible and testable before the final UMS adapter exists.
- Deployments must supply platform-specific WAF, durable store, SIEM and security-assurance integrations.

## Alternatives considered

- Trust `SameSite` cookies alone: rejected because it is not sufficient for high-risk mutations.
- Store replay/idempotency state only in a Next.js process: rejected for production because horizontally scaled processes cannot provide a system-wide atomic guarantee.
- Accept actor identifiers or MFA flags from frontend payloads: rejected because browser input is not a trust boundary.

## Verification / follow-up

- Implement the UMS adapter that creates `TrustedActorContext` from verified server-side claims.
- Implement distributed `ReplayStore` and `IdempotencyStore` adapters in the BFF/backend deployment.
- Translate the gateway policy contract into the selected gateway/WAF product and record its policy identifier.
- Connect structured events to the approved SIEM and confirm redaction, retention, alerting and access controls.
- Complete and independently approve the penetration test before setting the production-release pipeline parameter.
