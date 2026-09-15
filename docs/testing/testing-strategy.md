# Testing strategy

## Objectives

Tests provide fast design feedback, verify critical business behavior and protect security boundaries. Coverage percentage is an indicator, not a release decision by itself.

| Layer       | Tool/pattern                                      | Primary purpose                                 |
| ----------- | ------------------------------------------------- | ----------------------------------------------- |
| Static      | TypeScript, ESLint, Prettier                      | Type, dependency and consistency feedback       |
| Unit        | Vitest                                            | Pure rules, reducers, formatters, schemas       |
| Component   | Testing Library + Vitest                          | User-visible states and accessible interaction  |
| Story       | Storybook + accessibility addon                   | Isolated variants, visual review and basic a11y |
| Integration | Vitest/MSW when added                             | Feature flow across UI, state and API contracts |
| End-to-end  | Playwright                                        | Critical browser journeys against a running app |
| Security    | SAST/SCA/secret scan/DAST and manual testing      | Security defects and dependency risk            |
| Contract    | Consumer/provider contract tooling to be selected | Prevent incompatible API changes                |

## What to prioritize

Highest assurance belongs to authentication and timeout behavior, account entitlement visibility, beneficiary changes, payment initiation, maker-checker approval/rejection, limits, OTP/step-up, file uploads/downloads and audit-relevant actions. Test the negative paths: a hidden button is not evidence that a direct call is denied.

## Test boundaries

- Unit-test pure business decisions without rendering.
- Component-test behavior through roles, labels and visible output; avoid implementation selectors.
- Mock at network boundaries, not internal hooks.
- End-to-end tests should cover a small set of critical journeys and authorization failures.
- Test schema rejection, timeout, partial data, duplicate events, reconnect and stale real-time data.
- Keep production-like security headers enabled in at least one integration environment.

## Pipeline gates

Pull requests run format, lint, type checking, unit/component and focused security tests, production build, Storybook, dependency audit, CycloneDX SBOM generation, Microsoft Security DevOps SAST/secrets/IaC analysis, Playwright and OWASP ZAP baseline DAST. The organization must approve/install the Azure scanner task and govern scanner versions and findings.

Production release additionally fails closed without evidence references for threat-model approval, the deployed WAF policy, DAST and an independent penetration test. These evidence checks supplement rather than replace review of scope, findings and risk acceptance.

## Test data

Use synthetic banking data only. Never copy customer, account, payment or credential data into fixtures, screenshots, snapshots or CI logs. Generated test identities should have explicit roles and entitlements so approval and access cases are readable.
