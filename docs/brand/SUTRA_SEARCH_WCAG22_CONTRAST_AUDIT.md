# Sutra Search OS — WCAG 2.2 AA Contrast & Focus Audit

**Date:** 12 November 2026  
**Repository:** `vetclicklab-cloud/vtl-open-seo`  
**Baseline:** Post-rebrand `main` (Sutra Search OS, Midnight & Sea Glass)  
**Scope:** Authenticated desktop Dashboard screenshot supplied by the owner; source-level inspection of shared UI components and dashboard styles. **No logged-in site-wide runtime inspection performed.**  
**Target:** WCAG 2.2 Level AA (SC 1.4.3, 1.4.11, 1.4.1, 2.4.7, 2.4.11 as applicable). This is a source-led audit, **not a WCAG conformance certification**.

## Executive assessment

Preserve the locked Midnight & Sea Glass palette. Normal body text, secondary text, main buttons, dark-sidebar links and dark-theme text have strong contrast. Issues come primarily from **semantic color collisions across the new dark sidebar and light cards**, opacity-reduced text, a shared weak input-control border and potentially weak focus indicators.

The "search bar" in the screenshot is actually the **project switcher**; its label and gear icon are nearly invisible at rest. This is a confirmed, high-priority bug.

## Measured color contrast

Ratios calculated from defined source CSS colors, including alpha compositing on the indicated background; rendered colors can vary by browser, environment and component context.

| Context | Foreground / indicator | Background | Ratio | Threshold | Assessment |
| --- | --- | --- | ---: | ---: | --- |
| Main body copy | `#182C3D` | `#F7F9FC` | 13.58:1 | 4.5 | Pass |
| Light secondary copy | `#4D6374` | `#F7F9FC` | 5.94:1 | 4.5 | Pass |
| Primary button text | `#FFFFFF` | `#0E7C86` | 4.95:1 | 4.5 | Pass |
| Brand accent on navy | `#2DD4BF` | `#101F33` | 8.91:1 | 4.5 | Pass |
| Sidebar ordinary nav text (70% alpha) | computed `#A7B3BB` | `#101F33` | 7.75:1 | 4.5 | Pass |
| Dark secondary copy | `#B7C8D2` | `#15283A` | 8.74:1 | 4.5 | Pass |
| **Project switcher label / gear** | `#E8F2F5` inherited | `#FFFFFF` | **1.14:1** | 4.5 / 3 | **Fail** |
| **Sidebar group labels** | computed `#667381` (40% alpha) | `#101F33` | **3.42:1** | 4.5 | **Fail** |
| **Inactive light-theme tabs** | computed `#74808B` (60% alpha) | `#FFFFFF` | **4.04:1** | 4.5 | **Fail** |
| **Input / unchecked control border (light)** | `#B7C8D2` | `#FFFFFF` | **1.72:1** | 3 | **Fail when necessary for control identity** |
| **Input / unchecked control border (dark)** | `#416078` | `#15283A` | **2.27:1** | 3 | **Fail when necessary for control identity** |
| **Active sidebar indicator** | `#0E7C86` | `#254357` | **2.10:1** | 3 | **Fail when indicator is necessary for state** |
| Light theme outer focus ring (50% opacity) | computed `#86BEC2` | `#FFFFFF` | **2.07:1** | See focus analysis | Weak; check whole focus treatment |
| Chart 4 / amber line | `#C27B36` | `#FFFFFF` | 3.40:1 | 3 graphic; 4.5 small text | Pass graphic; not small text |
| Chart 5 / pink line | `#CC577C` | `#FFFFFF` | 4.02:1 | 3 graphic; 4.5 small text | Pass graphic; not small text |

Note: decorative separators, inactive controls and logos have different contrast exceptions. Do **not** apply the 3:1 threshold indiscriminately to all card borders, hover tints, illustrations or decorations.

## Priority findings and recommended code corrections

### P1. Project-switcher label and gear disappear at rest — confirmed

**Source:** `src/client/features/projects/ProjectSwitcher.tsx`; root sidebar `src/client/components/Sidebar.tsx`.

**Mechanism:** `ProjectSwitcher` mounts a `bg-card` (white in light mode) wrapper within the sidebar (`--sidebar-foreground: #E8F2F5`). The trigger label and the adjacent ghost settings button inherit sidebar foreground instead of card foreground. Hover changes their visibility; hover-dependent legibility is not acceptable.

**Minimal repair:** Put `text-card-foreground` on the **project switcher card wrapper** (including its settings button) and explicitly test nested project name/domain, settings gear, chevron, hover, focus and selected state. Also review the loading skeleton branch for consistency. Do not recolor the whole sidebar or remove the white selector.

**Acceptance:** Both name and gear visible without interaction; normal text >=4.5:1 and meaningful gear >=3:1 in light and dark theme.

### P1/P2. Insufficient control outlines in shared fields — systemic

**Source:** `src/client/styles/app.css` `--input` theme tokens; UI components `input.tsx`, `textarea.tsx`, `input-group.tsx`, `select.tsx`, `combobox.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `toggle.tsx`.

Light `#B7C8D2` on white = 1.72:1; dark `#416078` on card `#15283A` = 2.27:1. Unchecked controls are the most concerning because their boundaries may be the only visual sign of a field.

**Repair options:** Introduce a semantic `--control-border` distinct from decorative `--border`; alternatively, strengthen `--input` after reviewing everywhere that token is used as a background (especially unchecked switches and `dark:bg-input/30`). Example candidates to test: `#728796` on white = 3.74:1 (3.54 on Cool White); `#708393` on `#15283A` = 3.84:1. Do not change every decorative card divider to the stronger control-border shade.

**Acceptance:** Required boundaries, unchecked switches, radio buttons, checkboxes and form fields meet >=3:1 at rest in both themes; text continues to meet >=4.5:1.

### P2. Sidebar group labels lack text contrast — confirmed

**Source:** `src/client/components/Sidebar.tsx`; `text-sidebar-foreground/40`.

Use `text-sidebar-foreground/55` (approx. 5.29:1 on `#101F33`) or a dedicated muted-sidebar-heading token. Preserve hierarchical distinction with uppercase tracking rather than relying on illegibility.

### P2. Inactive tabs fall below 4.5 — confirmed

**Source:** `src/client/components/ui/tabs.tsx`; default `text-foreground/60`.

At rest against white, the actual color is ~4.04:1; against Cool White, ~3.94:1. Prefer `text-muted-foreground` in the light theme (the approved Slate color already clears 4.5:1). Verify active/inactive/hover/focus/disabled across both themes.

### P2. Active sidebar navigation marker uses the wrong accent token — confirmed

**Source:** `src/client/components/Sidebar.tsx`; `data-active:before:bg-primary`.

Change to `data-active:before:bg-sidebar-primary`, the Aquamarine reserved for a navy sidebar, which gives ~5.59:1 against the active background `#254357`. Active text and navigation semantics should remain accessible independently of color.

### P2. Keyboard focus and menu selection — needs rendered verification

**Source:** shared `button.tsx`, `input.tsx`, `tabs.tsx`, `combobox.tsx`, `dropdown-menu.tsx`, `checkbox.tsx`, `radio-group.tsx`, `field.tsx`, `sidebar.tsx`.

Many controls use `focus-visible:ring-ring/50`, only ~2.07:1 on white. Some also apply solid `focus-visible:border-ring` which may make focus visible; test the **combined rendered focus indication**, not an isolated CSS value. Also inspect `focus:bg-accent` menu rows (`#E3F2F2` against white ~1.15:1): subtle hover tints can be acceptable, but keyboard focus and selected-state cues must remain perceivable.

**Acceptance:** All interactive elements show distinct keyboard focus; no critical selection state solely indicated by color; overlays and focus order do not conceal focus.

### P3. Data visualization and semantic status — conditional review

**Source:** `src/client/styles/app.css` `--chart-1..5`, dashboard and charts (`src/client/components/ui/chart.tsx`).

All five provided light chart colors pass 3:1 on white as meaningful graphic colors; amber and pink are **not** acceptable for small text on white. Use Ink/Slate for legend and data text where appropriate. Use shapes/dashes/markers and readable legends; check tooltips, thresholds, red/green-only changes, and simulations for common color-vision differences. Preserve semantic success/warning/error separate from brand accents.

### P3. Opacity, disabled and loading states — audit in context

Review `text-foreground/50`, `opacity-50`, placeholder copy and temporary-loading states across the app. Actual disabled components have a WCAG exemption, but active controls and useful information must not become faint due to styling.

### P3. Branding consistency observed separately

Dashboard CTA still says **"Use OpenSEO in ChatGPT or Claude"**. This is not a contrast failure, but it is visible leftover branding; verify MCP/client product instructions before renaming promises, endpoints or support links.

## Cross-page verification matrix

Inspect **desktop + mobile**, **light + dark**, and **rest / hover / keyboard focus / selected / invalid / disabled** states for each:

- Authentication (sign-in, invite), onboarding, Dashboard, project selector and project settings.
- Keyword Research, Domain Overview, Backlinks and tables.
- Prompt Research, Prompt Explorer, Prompt Tracking, AI agents and MCP settings.
- GSC Insights, Rank Tracking, Local SEO, Saved Keywords and Site Audit.
- Dropdowns, comboboxes, checkboxes, radios, switches, pagination, empty states, alerts, dialogs, report tooltips, data charts.

Verify 320px/375px mobile, 768px tablet, 1440px desktop, 200% zoom, keyboard-only, and Windows forced-colors / high contrast.

## Release acceptance criteria

- [ ] Ordinary text >=4.5:1; large text >=3:1; essential non-text graphics and control boundaries >=3:1.
- [ ] Project name, domain, gear and all keyboard-operable actions visible **before hover**.
- [ ] Navigation groups, inactive tabs, unchecked controls and charts checked in both themes.
- [ ] Keyboard focus is clearly discernible and not obscured.
- [ ] No meaning conveyed through color alone.
- [ ] Automated token contrast regression tests and Playwright/axe checks; manual screenshots for critical flows.
- [ ] `pnpm ci:check`, typecheck and build pass; no backend/Cloudflare/DataForSEO changes.
- [ ] Reviewed minimal repair PR before any manual production deployment; **never rerun initial Alchemy bootstrap**.

## Sources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Understanding 1.4.3 — Text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)
- [Understanding 1.4.11 — Non-Text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)

**Note:** Full site-wide WCAG conformance cannot be claimed from a screenshot and source inspection alone; authenticated rendered states and assistive-technology workflows still need testing.
