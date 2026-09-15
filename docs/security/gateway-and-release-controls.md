# Gateway, WAF and production release controls

## Gateway/WAF contract

`config/security/gateway-policy.json` is a vendor-neutral minimum contract. Platform engineering must translate it into the selected API gateway, ingress and WAF. The production release gate requires the deployed policy identifier; the JSON file alone is not evidence that a control is active.

The trusted edge must:

- terminate approved TLS and redirect HTTP to HTTPS;
- normalize requests and reject ambiguous content length/transfer encoding;
- enforce body-size, timeout, connection and distributed rate limits before Next.js;
- enable reviewed managed WAF rules, bot protection and anomaly detection;
- strip client-supplied identity, forwarding and internal routing headers, then inject canonical values;
- restrict backend origins so callers cannot bypass the gateway;
- send WAF/security events to the approved SIEM with redaction and alert ownership.

`TRUST_PROXY_HEADERS=true` is permitted only after those strip-and-inject controls are verified. Otherwise the application deliberately groups requests under an unattributed local rate-limit key rather than trusting a spoofable IP header.

## Application enforcement

- Production CSP is enforced even if `CSP_MODE=report-only` is supplied.
- Unsafe `/api/bff/*` requests require an allowed exact Origin, acceptable Fetch Metadata, CSRF cookie/header proof, idempotency key, request nonce and fresh timestamp.
- Route Handlers must additionally use bounded schema parsing, consume the replay nonce using a shared store and wrap side effects with the idempotency store.
- Application in-memory stores and rate limits are test/reference and single-process defense-in-depth controls, not distributed production guarantees.
- Sensitive responses use the shared no-store policy and never include credentials or unnecessary banking data.

## CI and independent assurance

The Azure pipeline performs locked installation, tests, production build, Storybook, dependency audit, CycloneDX SBOM generation, Microsoft Security DevOps scanning, browser E2E tests and OWASP ZAP baseline DAST. Configure protected `ZAP_IMAGE` with an organization-approved digest-pinned image reference; the DAST stage fails closed when it is absent.

Before using `productionRelease=true`, configure protected pipeline variables containing evidence references:

- `THREAT_MODEL_APPROVAL_ID`
- `WAF_POLICY_ID`
- `DAST_REPORT_ID`
- `PENETRATION_TEST_REPORT_ID`

The gate proves only that traceable evidence was supplied. Release governance must validate report scope, tester independence, artifact/version coverage, finding disposition and expiry. A baseline DAST scan does not replace authenticated active testing, business-logic testing or an independent penetration test.
