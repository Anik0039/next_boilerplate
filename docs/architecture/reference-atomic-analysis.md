# Reference frontend Atomic Design analysis

## Scope

This analysis is limited to the Atomic Design and adjacent composition patterns under `D:\era\cif\CIF-FE\cif_fe\src`. It does not adopt that application's business logic, authentication design or API contracts.

## Observed structure

| Reference area         | Observed purpose                                              | Treatment in this boilerplate                                                      |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `components/ui`        | Low-level shadcn-style primitives                             | Retained as the lowest shared presentation layer                                   |
| `components/atoms`     | Small components such as Heading, Text and Logo               | Retained for business-neutral visual units                                         |
| `components/molecules` | Small compositions such as NavLink, SearchBar and ThemeToggle | Retained for reusable combinations                                                 |
| `components/organisms` | Larger sections such as SiteHeader, SiteFooter and StateDemo  | Retained only for cross-capability sections; business organisms move into features |
| `components/templates` | Page layout represented by MainLayout                         | Retained for business-neutral layout composition                                   |
| `components/providers` | Store, theme and query provider wrappers                      | Adapted into explicit `src/providers` composition with minimal scope               |
| `store`                | Redux Toolkit store factory, typed hooks and UI slice         | Retained and extended with RTK Query as the single client server-state convention  |
| barrel exports         | Public exports at atomic layer boundaries                     | Retained selectively at stable boundaries                                          |

The reference documents the dependency direction as `ui → atoms → molecules → organisms → templates → app/pages`. That direction is clear for shared UI and is preserved.

## Strengths retained

- Clear distinction between primitive controls and composed presentation.
- Predictable component discovery and naming.
- Reusable templates separate from page routes.
- Provider wrappers kept out of leaf components.
- Per-request Redux store factory and typed Redux hooks.
- Deliberate barrel exports at public boundaries.

## Adaptations for CIB

The expected CIB surface contains multiple large business capabilities. A global Atomic Design tree alone would group files by visual size while distributing one business change across models, API hooks, state and organisms. The boilerplate therefore adds `src/features/<capability>` as the primary business boundary.

Shared Atomic Design remains under `src/components`. Capability-specific UI stays with its model and API adapters; for example, `features/accounts/ui/organisms/accounts-overview.tsx`. Private atoms or molecules may also live inside a feature until they prove neutral reuse.

## Patterns not copied

- Browser-persisted bearer-token handling is not adopted. The target direction is server-mediated sessions, pending the identity/BFF decision.
- Direct browser ownership of backend service topology is not assumed. Same-origin endpoints are preferred until the gateway contract is known.
- A second server-state library is not included. RTK Query supplies the initial cache and request convention.
- The reference folder layout is not evidence for CIB backend services, databases or deployment boundaries.

## Resulting rule

Use Atomic Design to classify reusable UI; use capabilities to own business behavior. When these rules conflict, business ownership wins and the component remains inside the feature until reuse is demonstrated.
