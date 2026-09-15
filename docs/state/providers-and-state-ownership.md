# Providers and state ownership guide

## Ownership rule

Use the smallest state mechanism that satisfies the consumers and lifecycle. Redux is included in the boilerplate, but its presence does not make every value global.

| State kind                     | Owner                            | Examples                                                       |
| ------------------------------ | -------------------------------- | -------------------------------------------------------------- |
| Component-local                | React `useState`/`useReducer`    | Open panel, form step, temporary input                         |
| URL/navigation                 | Next.js router and search params | Filters that should be linkable, pagination, selected tab      |
| Server-derived cache           | RTK Query                        | Account summaries, enquiries, reference data                   |
| Cross-route client workflow/UI | Redux slice                      | Draft wizard metadata, balance masking, coordinated selections |
| Stable ambient dependency      | React Context/provider           | Theme, feature flags, SDK instance                             |
| Credentials/session authority  | Server/session layer             | Never Redux or ordinary Context                                |

React local state means state owned by a component tree through React hooks. It is not synonymous with React Context. Context distributes a value; it should be used for stable dependencies or configuration, not as an unstructured global store.

## Provider rules

- `AppProviders` is the single composition point.
- Keep provider order explicit and document dependencies between providers.
- A new provider requires more than one distant consumer or a library requirement.
- Do not put rapidly changing domain state into Context; it causes broad renders and obscures ownership.
- Keep provider values stable with memoization where required.
- Prefer a capability-local provider when its lifetime does not span the application.

## Redux rules

- Create the store through `makeStore`; do not export a process-wide singleton from a server-rendered application.
- Use typed hooks from `store/hooks.ts`.
- Use RTK Query for remote server state instead of duplicating loading/data/error state in slices.
- Store serializable domain/UI data only. Never store tokens, passwords, OTPs, cryptographic material or complete sensitive responses without need.
- Normalize large entity sets and use memoized selectors when profiling shows value.
- Register capability endpoints through `baseApi.injectEndpoints`.

## Real-time updates

The sample streams balance updates into the RTK Query cache using Server-Sent Events. This proves a pattern, not the production protocol. Before adoption, confirm authorization, reconnect semantics, event ordering, idempotency, stale-data behavior, fan-out capacity and audit requirements. WebSocket, SSE or polling selection is captured as a proposed ADR.
