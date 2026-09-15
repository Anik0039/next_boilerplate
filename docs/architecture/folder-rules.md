# Folder and dependency rules

## Canonical structure

```text
src/
├── app/                         # routes, layouts, route handlers
├── features/
│   └── accounts/
│       ├── api/                 # capability endpoints/adapters
│       ├── model/               # schemas, types and pure rules
│       ├── ui/organisms/        # capability compositions
│       └── index.ts             # public API
├── components/
│   ├── ui/                      # low-level design-system primitives
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/               # only truly cross-capability compositions
│   └── templates/
├── providers/                   # app-wide client providers
├── store/                       # store factory, hooks, base API, shared slices
├── security/                    # reviewed security utilities
├── lib/                         # neutral utilities
└── test/                        # common test setup
```

## Security placement

`src/security/server` owns request parsing, origin/CSRF enforcement, rate-limit support, audit normalization, replay/idempotency interfaces and trusted-actor contracts. `src/security/csrf-client.ts` is the narrow browser helper used by RTK Query. Capability-specific policies such as payment limits and maker-checker transitions remain inside their feature.

## Dependency rules

1. `app` may import feature public APIs and shared layers.
2. A feature may import shared components, store infrastructure, security helpers and neutral libraries.
3. Shared components must not import features, routes or business-specific state.
4. Do not deep-import another feature. Export the required contract through its `index.ts` or create an application orchestration layer.
5. `ui` primitives must be behavior-light. Atoms remain indivisible visual units; molecules combine a few atoms; organisms coordinate a meaningful section; templates define layout without business data fetching.
6. Place code at the lowest ownership scope that can legitimately own it. Do not make something global merely for convenient importing.
7. Avoid catch-all `utils.ts`, `types.ts` and `common` directories. Name code after its responsibility.
8. All financial browser mutations use `/api/bff/*`; exceptions such as identity callbacks or webhooks require a separate reviewed request-authentication design.
9. Actor identity, assurance and roles enter feature policies only through server-verified UMS context. Never construct trusted actor context from browser input.

## Server/client boundaries

- Files are server-compatible unless they need stateful React hooks, event handlers, browser APIs or a client-only dependency.
- A client component pulls all its imports into the client graph. Keep its dependency surface narrow.
- Add `server-only` to modules containing secrets or privileged server integrations when those modules are introduced.
- `NEXT_PUBLIC_*` values are public and must never contain secrets.

## Naming and exports

- Directories and non-component files use kebab-case; React component symbols use PascalCase.
- Capability folders use business language agreed with analysts.
- Each feature exposes a deliberate public API through `index.ts`.
- Barrels are allowed at stable boundaries, not as automatic exports of every internal file.

## Review triggers

An ADR or architecture review is required when adding a global provider, new state library, cross-feature dependency, client-side credential mechanism, unsafe HTML path, real-time transport, analytics SDK or third-party script.
