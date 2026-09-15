# CIB Frontend Agent Guidance

## Before changing code

- Read the relevant guides in node_modules/next/dist/docs for the installed Next.js version.
- Read docs/architecture/overview.md and the applicable ADRs.
- Run npm run validate before handing over a change.

## Architecture rules

- Organize business behavior under src/features by capability.
- Preserve the UI dependency direction: ui primitives -> atoms -> molecules -> organisms -> templates -> routes.
- Shared UI must not import from a business feature.
- Feature code may use shared UI; one feature must not import another feature's internals.
- Keep Server Components as the default and make client boundaries narrow.
- Use providers only for genuine cross-cutting dependencies.

## State rules

- Use local React state for component-local concerns.
- Use URL or form state for navigation and form concerns.
- Use Redux Toolkit for shared mutable client state.
- Use RTK Query for API cache and controlled streaming updates.
- Never put passwords, OTPs, access tokens, refresh tokens, or unnecessary banking data in Redux.

## Security rules

- Frontend visibility is not authorization; backend services enforce every entitlement.
- Do not use localStorage or sessionStorage for authentication tokens.
- Do not introduce dangerouslySetInnerHTML outside the audited SafeHtml component.
- Do not expose secrets through NEXT_PUBLIC variables.
- Do not create generic proxy endpoints or dynamic backend URLs from user input.
- Treat CSP changes, new third-party scripts, and new external origins as security-reviewed changes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
