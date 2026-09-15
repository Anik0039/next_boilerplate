# Component development and Storybook guide

## Placement decision

Ask in order:

1. Is it a low-level styled control? Put it in `components/ui`.
2. Is it a generic indivisible presentation element? Use `components/atoms`.
3. Does it combine a small number of generic elements? Use `components/molecules`.
4. Does it coordinate a reusable, business-neutral section? Use shared `organisms`.
5. Does it define page structure without business data? Use `templates`.
6. Does it know a capability contract or invoke a capability endpoint? Keep it inside that feature, commonly under `features/<name>/ui/organisms`.

Atomic level is less important than correct ownership. Do not promote a component to shared merely because two nearby screens happen to look similar.

## Component contract

- Use semantic HTML first and expose an accessible name for controls.
- Keep props explicit and narrow; avoid Boolean-flag combinations that create invalid states.
- Separate formatting/pure business rules from rendering when independently testable.
- Support keyboard, focus, zoom and screen-reader behavior.
- Include loading, empty, error, disabled and restricted states where relevant.
- Never decide authorization only from visual state.
- Avoid exposing raw HTML props. Use the reviewed sanitization path only when the requirement is real.

## Storybook expectations

Every shared component and meaningful feature composition should include stories for relevant states:

- default and variants;
- long/localized text and responsive constraints;
- loading, empty and error states;
- keyboard/focus behavior;
- restricted/disabled presentation;
- high-value accessibility scenarios.

Run `npm run storybook` locally and `npm run storybook:build` in CI. The accessibility addon is configured to fail Storybook accessibility checks; automated results support but do not replace manual assistive-technology testing.

## Review checklist

- [ ] Correct shared or capability ownership
- [ ] No inverted feature dependency
- [ ] Semantic HTML and accessible name
- [ ] Keyboard and visible-focus behavior
- [ ] Responsive and localization-safe layout
- [ ] Sensitive values minimized/masked as required
- [ ] Story and focused component test added
- [ ] No unreviewed client boundary or unsafe HTML
