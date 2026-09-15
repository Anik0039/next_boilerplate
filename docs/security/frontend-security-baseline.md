# Frontend security baseline

## Scope and claim

This repository implements a preventative browser, Next.js and BFF security foundation. It does not replace UMS authentication/session management, backend authorization/entitlement enforcement, a deployed gateway/WAF, SIEM controls or independent security assurance. See the [threat model](threat-model.md), [gateway and release controls](gateway-and-release-controls.md) and [ADR 0007](../adr/0007-financial-request-security-controls.md).

## UMS and authorization boundary

UMS/Keycloak will own authentication and session behavior. Backend services remain authoritative for entitlements, account access, transaction limits and approval authority. This implementation deliberately does not infer identity or authorization from UI visibility, Redux, request bodies, query strings or browser-controlled headers.

Payment security rules accept `TrustedActorContext`, which may be created only by the future server-side UMS adapter after claim/session verification. The adapter, session lifecycle and entitlement contract remain follow-up work.

## Cross-site scripting and CSP

- React escaping is the default. Direct `dangerouslySetInnerHTML` remains prohibited outside the audited `SafeHtml` allowlist.
- `src/proxy.ts` creates a fresh per-request nonce and uses strict script/style directives.
- Production always sends enforcing `Content-Security-Policy`; a report-only override works only outside production.
- Both legacy `report-uri` and Reporting API `report-to` point to the hardened report endpoint.
- CSP reports are capped at 16 KiB, content-type and schema validated, URL query/fragment data removed, rate limited and converted to allowlisted structured events.
- The deployment must deliver those structured events to an access-controlled SIEM. Application console output is transport, not the evidence store.

New third-party origins or scripts require security review and CSP tests. Never add broad origins, `unsafe-inline`, or production `unsafe-eval` merely to resolve compatibility problems.

## CSRF and request integrity

Unsafe `/api/bff/*` requests fail closed unless they provide all of the following:

- an exact allowlisted `Origin` and non-cross-site Fetch Metadata;
- a signed, expiring CSRF token matching the server-issued HttpOnly cookie;
- a UUID `Idempotency-Key`;
- a unique UUID request nonce;
- an ISO timestamp inside the accepted freshness window.

The RTK Query base query obtains CSRF proof from `/api/security/csrf` and adds these headers to mutations. It does not store the CSRF token in Redux or persistent browser storage. Route Handlers still must consume the nonce in a shared replay store and execute side effects through an atomic shared idempotency store.

The final UMS integration must confirm token rotation/binding behavior across login, logout, session renewal and multi-tab use. Explicit exceptions such as external webhooks or identity callbacks require separate authentication and request-signature designs; never bypass the financial BFF guard casually.

## Transaction controls

- Payment request schemas accept positive integer minor units, not floating-point amounts.
- Per-transaction and daily limits are checked using integers.
- High-value payments require recent step-up evidence from trusted UMS context.
- A maker cannot approve/reject the same payment; checker identities cannot be reused; approval/rejection requires recent UMS step-up; execution requires completed approval.
- The backend remains authoritative and must make limit reservation, maker-checker state transition and execution atomic under concurrency.
- Idempotency keys are scoped by trusted actor and operation. Reuse with another fingerprint is rejected; completed results are replayed without executing the side effect again.
- Request nonces are actor/operation scoped and single use.

The included in-memory replay and idempotency implementations are reference/test utilities. Production must connect the interfaces to a distributed, durable, atomic store or enforce the equivalent in the backend/gateway.

## Input, rate and cache controls

- `parseJsonRequest` validates content type, declared and streamed byte length, UTF-8 JSON and a Zod schema.
- The CSP/CSRF endpoints have application rate limits. The gateway contract defines authoritative distributed limits, timeouts and WAF controls.
- Forwarding headers are ignored unless `TRUST_PROXY_HEADERS=true`; that setting requires a verified gateway that strips spoofed inputs.
- Sensitive JSON and SSE responses use private no-store headers. The Accounts RTK Query cache is discarded when unused.
- Real endpoints must define route-specific schemas, maximum sizes, timeouts, retry semantics and data minimization.

## Demo isolation

Demo APIs require both a non-production `NODE_ENV` and explicit `ENABLE_DEMO_API=true`. Production always returns 404 regardless of that flag. CI/E2E may opt in locally; deployments must not carry synthetic routes forward as real service contracts.

## Supply chain, testing and release gates

The Azure pipeline includes exact Node selection, `npm ci`, lint/type/unit/security/build/Storybook/E2E checks, `npm audit`, a CycloneDX SBOM, Microsoft Security DevOps SAST/secrets/IaC scanning and OWASP ZAP baseline DAST. Organization owners must approve/install the scanner task and provide protected `ZAP_IMAGE` as an approved digest-pinned or internally mirrored image reference.

A production run additionally requires evidence identifiers for the approved threat model, deployed WAF policy, DAST report and independent penetration-test report. This is a fail-closed evidence gate, not a substitute for reviewing the reports.

## Remaining production responsibilities

- Implement and test the UMS/Keycloak adapter, session lifecycle and authoritative backend entitlements.
- Deploy the gateway/WAF contract and prevent direct origin bypass.
- Connect replay/idempotency storage and SIEM transport to production services.
- Validate currency precision, ledger concurrency, limit reservation, transaction signing and approval policy with domain owners.
- Run authenticated DAST, business-logic abuse testing and an independent penetration test against the release environment.
- Close or formally risk-accept findings through bank governance before go-live.
