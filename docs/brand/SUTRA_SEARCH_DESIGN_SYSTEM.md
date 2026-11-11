# Sutra Search OS — Brand system v1

**Status:** Working identity, Midnight & Sea Glass palette approved. Verify trademarks and domain availability before commercial launch.

## Naming

- Master brand: Sutra Search; descriptor: Search OS.
- Wordmark: lowercase `sutra.` plus small uppercase `SEARCH OS`.
- Icon: continuous S-shaped thread with two endpoint nodes.

## Palette

| Role | Hex |
| --- | --- |
| Midnight Navy | `#101F33` |
| Ocean Teal | `#0E7C86` |
| Aquamarine | `#2DD4BF` |
| Cool White | `#F7F9FC` |
| Deep Ink | `#182C3D` |
| Slate | `#4D6374` |
| Silver | `#B7C8D2` |
| Soft Border | `#DEE7EE` |
| Optional AI Violet | `#6D61D8` |

## Implementation boundaries

- `src/client/styles/app.css` contains the semantic light and dark palette.
- `SutraBrand` is shared by the desktop sidebar, mobile header and authentication.
- `src/public/sutra-*` assets supply favicon, Apple touch and installable app branding.
- Keep upstream `openseo` / `openseo-dark` theme identifiers, routes, D1 schema, auth, Workers, R2, KV, and deployment configuration unchanged.
- Preserve license and original attribution. Do not replace backend API names.
- Charts and status chips retain independent semantic meaning; avoid coding good/bad states by brand color.

## Review checklist

- Check desktop and mobile auth, navigation, project switcher and first-load identity.
- Review focus rings, button contrast, menus, modals, empty states, charts, and tables in light/dark modes.
- Validate 16px, 32px, 180px, 192px and 512px icon readability.
- Run CI/typechecks and review before any manual Cloudflare deployment. Do not rerun bootstrap.
