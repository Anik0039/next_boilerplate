# 0004 — Defense-in-depth frontend security baseline

- Status: Superseded by [ADR 0007](0007-financial-request-security-controls.md)
- Date: 2026-09-12
- Owners: Frontend architecture, application security and platform teams

## Context

Corporate banking exposes sensitive data and high-impact operations. Browser controls reduce attack surface but cannot replace server-side authentication, authorization, validation, workflow enforcement or audit.

## Decision

Adopt a baseline of React-safe rendering, reviewed rich-text sanitization, nonce-based CSP with report-only rollout, security headers, same-origin API preference, runtime input validation, no browser-persisted credentials, dependency locking/scanning, and security-focused tests. Server authorization remains authoritative.

## Consequences

- Common XSS, clickjacking, data-leakage and supply-chain risks receive explicit treatment.
- CSP and headers may expose compatibility work with third-party tools and SSO journeys.
- The baseline requires operational monitoring and security ownership, not configuration alone.

## Alternatives considered

- Rely only on framework defaults: rejected as insufficient for this risk profile.
- Enforce a strict CSP immediately: rejected because compatibility must first be observed and corrected.

## Verification / follow-up

Complete a threat model, connect approved security tools in Azure DevOps, exercise CSP reports, and conduct DAST and penetration testing before production approval.
