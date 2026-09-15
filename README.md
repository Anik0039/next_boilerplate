# Corporate Internet Banking frontend architecture

This repository is a runnable Next.js reference implementation and handover package for the Phase 2 frontend. It demonstrates the agreed direction: capability-oriented modules with Atomic Design inside the UI composition, explicit providers, Redux Toolkit with RTK Query, narrow client boundaries, and a security baseline suitable for refinement with the bank's identity and API teams.

It is a starting point, not evidence that authentication, authorization, workflow approval, or regulatory controls are complete.

## Quick start

Prerequisites: Node.js 22.13 or newer and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Useful checks:

```bash
npm run validate
npm run test:security
npm run storybook
npm run test:e2e
```

The demo API requires explicit `ENABLE_DEMO_API=true` outside production. It cannot be enabled when `NODE_ENV=production`, even through configuration. Set `NEXT_PUBLIC_ENABLE_DEMO_FEATURES=false` to hide the example UI.

## Handover map

- [Architecture overview](docs/architecture/overview.md)
- [Reference Atomic Design analysis](docs/architecture/reference-atomic-analysis.md)
- [Folder and dependency rules](docs/architecture/folder-rules.md)
- [ADR index](docs/adr/README.md)
- [Frontend security baseline](docs/security/frontend-security-baseline.md)
- [Frontend threat model](docs/security/threat-model.md)
- [Gateway and production release controls](docs/security/gateway-and-release-controls.md)
- [Providers and state ownership](docs/state/providers-and-state-ownership.md)
- [Component and Storybook guide](docs/ui/component-and-storybook-guide.md)
- [Testing strategy](docs/testing/testing-strategy.md)
- [How to add a capability](docs/guides/adding-a-capability.md)
- [Azure DevOps pipeline](azure-pipelines.yml)

## UI vocabulary analysis

A clear shared Atomic Design chain (`ui` → atoms → molecules → organisms → templates), provider components, Redux Toolkit and barrel exports. This boilerplate retains those useful conventions while placing business behavior in `src/features/<capability>`.

Authentication tokens must not be stored in Redux, Context, `localStorage`, or `sessionStorage`; the final session/BFF design remains an explicit architecture decision with the backend and security teams.
# next_boilerplate
