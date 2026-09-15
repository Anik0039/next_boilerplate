# CIB frontend threat model

## Status and scope

This is the repository's initial threat model for the browser, Next.js rendering tier and BFF boundary. It covers the implemented boilerplate controls and must be reviewed and approved by Application Security, UMS/Identity, API Gateway and the payment-domain owner before production. UMS authentication/session mechanics and backend entitlement enforcement are intentionally outside the current implementation scope.

Synthetic demo data is not customer data. The model must be revisited when real login, beneficiary, payment, approval, upload/download or reporting contracts are introduced.

## Assets

- Customer and corporate identity context supplied by UMS.
- Account, beneficiary, payment, approval and balance data.
- Transaction intent, limits, approval state and execution result.
- CSRF secrets, service credentials and signing material.
- Security events, audit records and correlation identifiers.
- Frontend source, build artifacts, dependencies and deployment configuration.

## Trust boundaries

| Boundary                | Untrusted side            | Trusted side                 | Required control                                                                         |
| ----------------------- | ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| Browser → gateway/WAF   | Browser input and network | Approved edge                | TLS, request normalization, WAF, rate/body limits, canonical client address              |
| Gateway → Next.js/BFF   | Forwarded request         | Next.js runtime              | Strip spoofable headers, exact origin policy, CSRF, schemas, replay/idempotency metadata |
| Next.js/BFF → UMS       | Identity assertions       | Verified actor adapter       | Validate issuer, audience, signature, time and assurance claims server-side              |
| BFF → banking backend   | UI-requested operation    | Authoritative domain service | Entitlements, account ownership, limits, maker-checker, idempotent execution and audit   |
| Runtime → SIEM          | Application event         | Controlled evidence store    | Redaction, integrity, retention, restricted access and alerts                            |
| Source → build artifact | Repository/dependencies   | Released artifact            | Review, locked installs, SAST/SCA/secrets scan, SBOM and provenance controls             |

## Threats and mitigations

| Threat                                       | Implemented mitigation                                                                                                    | Residual or deployment requirement                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Script/style injection                       | React escaping, narrow `SafeHtml`, strict nonce CSP, no `unsafe-eval` in production                                       | Exercise CSP with all approved third parties; independently test stored/reflected/DOM XSS         |
| CSRF                                         | Signed expiring token, HttpOnly host-scoped cookie in production, header equality, exact Origin and Fetch Metadata checks | Bind/rotate with the final UMS session policy and test real SSO/logout behavior                   |
| Duplicate financial execution                | Required UUID idempotency key, request fingerprint and stored-response contract                                           | Backend/shared store must claim keys atomically and retain them for the business-approved period  |
| Replay of captured mutation                  | Bounded timestamp plus actor/operation-scoped one-time nonce contract                                                     | Shared replay store and TLS termination must be configured at the trusted boundary                |
| Maker approves own payment                   | Immutable maker ID and distinct-checker rule based on `TrustedActorContext`                                               | UMS adapter must derive actor ID; backend remains authoritative                                   |
| MFA flag spoofing or stale step-up           | High-value submission and checker decisions require fresh step-up from trusted actor context                              | UMS must define assurance claims, clock policy and transaction-specific challenge behavior        |
| Limit bypass or amount rounding              | Positive integer minor-unit schema, per-transaction and daily-limit rules                                                 | Backend ledger supplies authoritative usage, currency precision and concurrency-safe reservations |
| Oversized/malformed input                    | Streaming byte limit, content-type enforcement and Zod schemas                                                            | Gateway applies earlier limits, timeouts, decompression and ambiguity checks                      |
| Brute force, scraping or resource exhaustion | Per-process rate-limit fallback                                                                                           | Gateway/WAF policy provides distributed actor/client limits, bot controls and anomaly blocking    |
| CSP telemetry poisoning or data leakage      | 16 KiB body cap, schemas, URL query redaction, structured event allowlist and rate limiting                               | SIEM ingestion must encode, restrict, deduplicate and alert without retaining prohibited data     |
| Sensitive browser/proxy caching              | No-store headers; sensitive RTK Query data discarded when unused                                                          | Review every real endpoint and clear client cache on UMS logout/session loss                      |
| Demo surface exposed in production           | Demo guard requires non-production **and** explicit opt-in                                                                | Deployment tests must continue to prove production returns 404                                    |
| Supply-chain compromise                      | Exact dependencies, lockfile, SCA, SAST/secrets/IaC task, SBOM and DAST pipeline steps                                    | Pin/mirror approved scanner images/tasks and sign/provenance-check release artifacts              |
| Security-control configuration drift         | Production CSP and security configuration fail closed; release evidence gate                                              | Platform owns configuration inventory, WAF policy deployment, drift alerts and rollback           |

## High-risk abuse cases to verify

1. Submit, approve or execute a payment by changing an actor, account, beneficiary, amount, currency or approval identifier.
2. Retry the same request concurrently across multiple BFF/backend instances.
3. Reuse an idempotency key with a changed body or replay a valid nonce after completion.
4. Make the maker act as checker, reuse one checker, bypass required checker count or execute before approval.
5. Reuse stale MFA/step-up evidence or send an MFA flag from the browser.
6. Exceed per-transaction/daily limits through concurrency, rounding, currency mismatch or delayed ledger updates.
7. Submit mutations cross-site, without Origin, with spoofed forwarding headers or with malformed transfer encoding.
8. Exfiltrate account/payment data through URLs, browser storage, caches, analytics, logs, errors or CSP reports.
9. Enable demo routes or report-only CSP through production environment configuration.
10. Exhaust report, CSRF, SSE or financial endpoints with large, slow or high-rate requests.

## Required approval evidence

- Threat-model review identifier and dated owner approval.
- Deployed gateway/WAF policy identifier matching `config/security/gateway-policy.json`.
- SAST, SCA, secrets/IaC, SBOM and DAST results for the release artifact.
- Independent penetration-test report with critical/high findings closed or formally risk accepted.
- UMS claim/session contract and backend entitlement/transaction enforcement evidence when those integrations land.
