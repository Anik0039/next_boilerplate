# 0005 — Server-mediated authentication/session and BFF

- Status: Proposed
- Date: 2026-09-12
- Owners: Identity, API/platform, security and frontend architecture teams

## Context

The frontend needs authenticated access to CIB APIs without exposing reusable credentials to ordinary JavaScript. UMS is confirmed as the Keycloak-based identity owner, while the final gateway topology, session policies, claim contract and token ownership are not yet confirmed. ADR 0007 now defines the browser/BFF CSRF and request-integrity protocol independently of those remaining choices.

## Proposed decision

Use an OAuth/OIDC flow mediated by UMS and a trusted server/gateway. Give the browser an opaque session cookie with `Secure`, `HttpOnly` and an appropriate `SameSite` policy. Prefer same-origin BFF calls. Keep access and refresh tokens server-side. Apply the ADR 0007 CSRF token, exact-origin and Fetch Metadata controls to state-changing cookie-authenticated requests, then bind their lifecycle to the final UMS session behavior.

## Consequences

- Browser token exfiltration exposure is reduced.
- A server/session tier becomes security-critical and must be highly available and observable.
- Logout, refresh, horizontal scaling, revocation and cross-channel behavior require explicit contracts.

## Alternatives considered

- Bearer tokens in `localStorage`: rejected for the proposed direction because script execution can extract reusable credentials.
- In-memory browser tokens: reduces persistence but still exposes tokens to injected script and complicates reload/session behavior.

## Verification / follow-up

Confirm gateway ownership, UMS MFA/OTP claims, cookie domain, CSRF rotation/binding, timeout/revocation requirements and deployment trust boundaries before accepting this ADR.
