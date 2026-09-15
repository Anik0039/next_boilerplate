# How to add a capability

This walkthrough uses `payments` as an example name only. Align the final folder name with the approved business vocabulary.

## 1. Define the boundary

Write a short capability statement, actors, sensitive data, required permissions, approval behavior and upstream/downstream contracts. Record unknowns rather than embedding assumptions in components.

## 2. Create the vertical slice

```text
src/features/payments/
├── api/
│   └── payments-api.ts
├── model/
│   ├── payment.ts
│   └── payment.test.ts
├── ui/
│   ├── molecules/
│   └── organisms/
└── index.ts
```

Keep private atoms/molecules here until they demonstrate genuine cross-capability reuse.

## 3. Define contracts and pure rules

Create runtime schemas for external data and infer TypeScript types from them where practical. Model statuses as explicit states. Pure rules must not assume that client-side checks authorize a payment.

## 4. Add server-state access

Inject endpoints into `store/base-api.ts` from the feature API module. Define caching, invalidation, errors, cancellation and retry behavior intentionally. Confirm whether the browser calls a same-origin BFF route or another approved gateway; do not introduce a new origin ad hoc.

Financial mutations belong under `/api/bff/*` and must use bounded request parsing, runtime schemas, the proxy CSRF/origin/freshness guard, actor-scoped replay consumption and durable idempotent execution. Supply an `Idempotency-Key` from the initiating user action so an intentional retry reuses the same key.

## 5. Build UI from the bottom needed

Compose approved shared primitives. Keep the business-aware organism in the feature. Promote a component to shared only when its API is capability-neutral and multiple consumers are known.

## 6. Compose the route

Import the feature through its public `index.ts` from the App Router page. Keep the page a Server Component unless interaction at that level is necessary. Add route `loading.tsx`, `error.tsx` and `not-found.tsx` when the journey requires them.

## 7. Decide state ownership

Use local state for local interaction, URL state for shareable navigation, RTK Query for server data and Redux slices only for coordinated cross-tree client workflow state. Never store credentials, OTPs or secrets in client state.

## 8. Test and document

- unit-test pure rules and schemas;
- component-test user states and accessibility;
- add Storybook stories;
- add integration/E2E coverage proportional to financial and authorization risk;
- test CSRF, stale/replayed requests, idempotency conflicts, limit boundaries, stale step-up and maker-checker negative paths;
- update the ADR index when a new architectural decision is introduced;
- update security threat scenarios and telemetry requirements.

## Definition of done

- [ ] Capability owner and boundary are clear
- [ ] API and authorization contracts are confirmed or marked open
- [ ] Loading, empty, error, restricted and success states exist
- [ ] Backend authorization has negative-path tests
- [ ] Financial side effects use shared production replay/idempotency stores and authoritative backend policy
- [ ] Sensitive data is minimized in state, URLs and telemetry
- [ ] Automated tests and stories pass
- [ ] Architecture/security documentation is updated
