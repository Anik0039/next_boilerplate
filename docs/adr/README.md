# Architecture Decision Records

ADRs capture consequential decisions, their context and trade-offs. Accepted decisions remain immutable except for status links; a new ADR supersedes an old one.

| ADR                                                 | Decision                                           | Status     |
| --------------------------------------------------- | -------------------------------------------------- | ---------- |
| [0001](0001-capability-oriented-atomic-design.md)   | Capability-oriented structure with Atomic Design   | Proposed   |
| [0002](0002-redux-toolkit-and-rtk-query.md)         | Redux Toolkit and RTK Query                        | Proposed   |
| [0003](0003-provider-composition.md)                | Explicit, minimal provider composition             | Proposed   |
| [0004](0004-frontend-security-baseline.md)          | Defense-in-depth frontend security baseline        | Superseded |
| [0005](0005-authentication-session-and-bff.md)      | Server-mediated authentication/session and BFF     | Proposed   |
| [0006](0006-real-time-transport.md)                 | Production real-time transport                     | Proposed   |
| [0007](0007-financial-request-security-controls.md) | Financial request and production security controls | Proposed   |

Statuses: **Proposed**, **Accepted**, **Deprecated**, **Superseded**, or **Rejected**.

## Template

```markdown
# NNNN — Decision title

- Status: Proposed
- Date: YYYY-MM-DD
- Owners: roles/team

## Context

## Decision

## Consequences

## Alternatives considered

## Verification / follow-up
```
