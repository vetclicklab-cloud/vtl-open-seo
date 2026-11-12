# Sutra Search OS — WCAG contrast repair

Addresses the failures documented in [audit PR #5](https://github.com/vetclicklab-cloud/vtl-open-seo/pull/5). This patch does not alter database, Cloudflare, backend, routing or API credentials.

## Changes

- Project switcher: explicit card foreground on its white surface in both loaded and loading states; card borders use decorative border token.
- Sidebar: 55% opacity for section headings and aquamarine active-state marker.
- Tabs: accessible muted-foreground instead of 60%-opacity main foreground.
- Forms: stronger `--input` outline tokens (`#728796` light, `#8195A3` dark). Decorative card border remains unchanged.
- Keyboard: full-opacity semantic focus ring on common interactive controls, visible focus styling for combobox trigger/list choices and dropdown menu items.
- Tests: programmatic contrast-regression checks for both themes and source-level guardrails for the specific project-switcher regression.

## Design invariants

The Midnight & Sea Glass identity is preserved. Primary teal and aquamarine are unchanged, semantic status colors and chart palette are unchanged, and accessibility improvements should not make noninteractive containers appear interactive.

## QA gates

- [ ] `pnpm ci:check` and `pnpm test:ci` pass.
- [ ] Self-hosted Cloudflare worker build passes.
- [ ] Light and dark theme: project name and settings gear readable **before hover**.
- [ ] Check unchecked controls, field edges, focus, selected states and active nav in both themes.
- [ ] Validate desktop, mobile, 200% zoom, contrast mode, and keyboard-only navigation.
- [ ] Color/contrast check across charts and legends (not only color-based coding).
- [ ] Visual review of sign-in, onboarding, project settings, research, reports, all dialogs.

**Note:** Unit contrast tests cannot substitute for a rendered and assistive-technology audit. Do not claim complete WCAG certification based on the automated checks alone.
