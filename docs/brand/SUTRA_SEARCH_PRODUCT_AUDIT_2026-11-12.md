# Sutra Search OS — Product, branding, API and integration audit

**Date:** 2026-11-12
**Scope:** vetclicklab-cloud/vtl-open-seo, Cloudflare selfhost (production running v0.1.26), existing live Worker/D1/KV/R2/Workflows
**Method:** Automated read-only inspection of 1,292 repository source/config files; targeted code examination; Cloudflare Worker binding metadata; public /api/health and sign-in page; Google/Cloudflare official documentation.
**Limit:** No authenticated journey or chargeable third-party API operations were performed. This is a source/runtime configuration audit, not a certification that every feature works.

## Executive decision

Sutra's branded app is deployed and the core database and password authentication are healthy. It is **not yet a complete independent product**. The highest risk is not appearance: customer-facing one-click agent installation links, MCP server metadata, support destinations, and the in-app SAM fact sheet still belong to upstream OpenSEO. Several integrations need additional credentials and potentially paid provider/platform capability.

The broad scan found **1,052 raw OpenSEO / Every App source references**, **136 external URL references**, **229 redirection/agent references**, and **498 provider/configuration references**. These are NOT defect totals: many are legitimate internal identifiers, comments, tests, upstream documentation, or the separate upstream marketing site.

## P0: Customer redirection and product ownership

### SUTRA-01 — One-click ChatGPT/Claude installations point to another product
- Evidence: src/client/features/ai-mcp/agentInstalls.ts has the hosted OpenSEO ChatGPT plugin ID and a Claude marketplace /connectors/openseo URL. These are reused on the dashboard and the agent onboarding flow.
- Additional evidence: .agents/skills/setup-openseo/SKILL.md explicitly instructs agents to install the hosted OpenSEO plugin and says it targets hosted OpenSEO, not this self-host.
- Risk: people think they are connecting Sutra, but may register/authenticate with upstream OpenSEO and see the wrong projects.
- Fix: remove or clearly qualify these buttons until a real Sutra plugin/connector exists. For now provide a Sutra custom MCP setup using https://open-seo-selfhost.vetclicklab.workers.dev/mcp with OAuth and no-cost whoami/list_projects verification. Publish proprietary Sutra one-click installs only after their destinations exist.

### SUTRA-02 — MCP server, OAuth and widgets still identify as OpenSEO
- Evidence: src/server/mcp/server.ts advertises name/title OpenSEO, website openseo.so and the original icon, with upstream credits/guest wording. src/server/mcp/oauth-errors.ts points to original reconnect help. src/client/mcp-widgets/main.tsx, useWidgetHost.ts and SearchConsoleConnection.tsx show the old product name.
- Fix: use Sutra metadata, trusted icon, support/consent wording, and self-hosted URLs; test authorization/refresh/revoke and compatible client discovery. Preserve existing protocol tool names and tokens unless migrations are designed.

### SUTRA-03 — Support and escalation contact still belong to OpenSEO
- Evidence: src/client/lib/support.ts is support@openseo.so; src/routes/_app/support.tsx points to upstream Discord and GitHub Issues. Additional hardcoded upstream support occurs in account deletion, billing and Google authentication errors.
- Fix: obtain an approved working Sutra support address, documentation/FAQ and owned issue intake before replacing. Maintain links to the upstream repository ONLY when explicitly labeled as technical attribution; never claim it is Sutra customer support.

### SUTRA-04 — In-app agent SAM has incorrect provider, pricing and product instructions
- Evidence: src/server/features/sam/samSystemPrompt.ts defines it as the OpenSEO agent. src/server/features/sam/openseo-fact-sheet.md details OpenSEO hosted pricing/trial, original ChatGPT plugin, original MCP host, Discord and support.
- Fix BEFORE enabling OpenRouter: create Sutra-specific verified product facts about self-host capabilities, pricing/not-yet-available billing, agents, vendor charges, actual support, and allowed actions. Keep source license attribution. Test SAM responses to product/billing/integration questions.

### SUTRA-05 — Auth/consent and report previews show upstream graphics
- Evidence: src/routes/_authenticated.oauth-consent.tsx has old product labels and logo. src/client/components/StatusScreen.tsx still uses an original-brand image. src/routes/connect.tsx and accept-invitation.$id.tsx have old strings. src/routes/s/$token/og[.]png.ts redirects fallback social artwork to https://openseo.so/social-card.jpg.
- Fix: brand all active auth/invite/consent screens; provide a Sutra-owned report social image; retain secure callback checks and link permissions. Legacy binary icons including transparent-logo.png still exist; remove only after auditing actual references.

## P1: Customer-facing words, links, error messages

### SUTRA-06 — Visible OpenSEO copy on active product screens
Confirmed examples:
- src/client/features/dashboard/DashboardAgentCard.tsx: "Use OpenSEO in ChatGPT or Claude" and generated demo prompt.
- src/client/features/dashboard/DashboardSetupAction.tsx and dashboardSteps.ts.
- src/client/features/ai-mcp/AgentSetupPanel.tsx, src/routes/_app/ai.tsx.
- src/client/features/gsc/GscReEngagementModal.tsx.
- src/client/features/audit/results/ResultsView.tsx and ShopifyCrawlWarning.tsx.
- src/client/features/reports/ReportsList.tsx.
- src/client/features/sam/SamSetupGate.tsx, SamSidebarPanel.tsx, SamBetaGate.tsx.
- src/client/features/integrations/GoogleOAuthSetupWarning.tsx, GoogleAccountRemovalDialog.tsx, googleAuthErrorCopy.ts.
- src/client/features/onboarding/AnalyticsOnboardingStep.tsx, src/client/features/settings/PrivacySettings.tsx.
- src/client/lib/error-messages.ts and src/client/features/settings/DeleteAccountSettings.tsx.
- src/routes/_app/help/*, _authenticated.subscribe.tsx, _authenticated.yc.tsx, auth-error.tsx, connect.tsx, accept-invitation.$id.tsx.
- src/client/mcp-widgets/*, and some account/email templates.

Recommendation: centralize presentation-only brand labels, support links and docs URL constants. Add automated tests that reject user-facing OpenSEO labels, with an explicit allowlist for protocol identifiers and legitimate upstream attribution.

### SUTRA-07 — Outbound documentation is often the original provider's website
Agent setup, MCP how-to, rank tracking notices, Google connection guidance, Shopify crawler and audit docs link to openseo.so or github.com/every-app/open-seo. Some are valid technical references; others are incorrectly presented as Sutra's own guides. Write Sutra docs for current self-host setup, maps, GSC/GA4 OAuth, DataForSEO billing, agents, password reset, cost limits, and support. Where upstream docs are still useful, label them "OpenSEO upstream technical reference".

### SUTRA-08 — Scope the rebrand; do not damage internal compatibility
Do NOT mass-rename Cloudflare Worker names, D1/R2/KV/Alchemy state names, migration/table IDs, API contracts, theme identifiers openseo/openseo-dark, OAuth provider IDs, local storage keys, MCP tool names or MIT license/attribution. The separate upstream web/ marketing bundle contains many original-domain redirects and is NOT the live self-host app. Rebuild that separately for a future Sutra website only after its domains and public copy are approved.

## Live technical baseline (read-only)

- Public https://open-seo-selfhost.vetclicklab.workers.dev/api/health returned status OK, version 0.1.26, auth mode password, database OK.
- Health reported DataForSEO key "Set" — presence alone does NOT prove actual account balance or paid endpoint success.
- Health reported GSC "Not configured (optional)" and OPENROUTER_API_KEY "not set" (SAM disabled). Context fallback also not configured.
- Cloudflare metadata confirmed app Worker and audit Worker with D1, R2, KV, OAuth KV, scheduled Workflows, Browser binding and Durable Object binding. A secret binding can exist with an EMPTY value, so merely seeing its name is not proof that it is configured.
- Previous authenticated Local SEO screenshot for Angel Pet showed "Google Maps unavailable", with keyword rankings "Not checked yet". Do not label that as a failed DataForSEO ranking scan.

## Provider and functional readiness matrix

| Feature | Provider/requirements | Verified today | Fix/test needed |
| --- | --- | --- | --- |
| Password sign-in, project navigation | Better Auth, D1 | Public auth/db health OK, prior dashboard screen | Test login/logout, role isolation, invites, password/admin recovery in authenticated session |
| Keyword, SERP, domain, backlinks | DataForSEO | Key present; live calls and balance unknown | Check balance/permission; one explicitly approved low-cost example per endpoint |
| Saved keywords, context, reports | D1 and R2 | Bindings exist; workflow not end-to-end tested | Save/read/delete, report rendering/sharing, error handling, privacy |
| GSC Insights | Google Search Console API and OAuth | NOT configured | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET; enable API and redirect /api/gsc/oauth/callback; test read-only connection |
| Google Analytics / GA4 | Google Analytics Data API and OAuth | Expected blocked by absent Google OAuth | Enable Analytics Data API, scopes, /api/ga4/oauth/callback; connect authorized GA4 property |
| Local SEO map | Google Maps Map Tiles API | Unavailable in screenshot; no key supplied by deployment workflow | GOOGLE_MAPS_API_KEY; Map Tiles enabled, billing, strict quota; test basemap independently of rankings |
| Local SEO rankings | DataForSEO Maps SERP | Not checked in screenshot | Verify cost estimate; first 1-point approved ranking scan, then larger grid |
| Rank tracking schedules | DataForSEO, Workflows and Cron | Workflow bindings present | Verify cron scheduling, task completion, provider balance and retry after failure |
| AI Visibility/Prompt Tracking | DataForSEO | Code/workflow exists; vendor result not tested | One approved low-cost prompt collection and history check |
| Prompt Research and AI setup | OpenRouter plus DataForSEO | OpenRouter NOT set | Configure limited-spend key; Workers Free 50 external subrequests may block multi-step setup |
| In-app SAM | OpenRouter + Durable Objects | Disabled | First correct SAM's branding/product facts, then enable controlled API key and test agent safety/functionality |
| Site audit ordinary HTML | Audit Worker, R2/D1/Workflows | Bound, no completed crawl verified | Crawl a permitted site, confirm full report/issue results and sensible limits |
| Site audit JavaScript rendering | Cloudflare Browser Run, optionally Context.dev | Browser binding present; fallback key missing; Free tier impractical | Workers Paid recommended for JS-heavy sites; CONTEXT_API_KEY optionally billed separately |
| MCP custom agents | Self-host /mcp, OAuth/API keys | App builds current-origin URL, handshake untested | Connect Sutra manually; verify whoami and list_projects, no paid research |
| Password resets / invitations | Self-host password mode | Invite links by design; selfhost docs say NO email delivery | Optional operator endpoint OPENSEO_OPERATOR_SECRET for resets/create-user; new transactional email UX is separate implementation |
| Shopify audit signature | CRAWLER_ACCESS_SECRET | Optional / not in deployment configuration | Stable 32+ char secret only if signed crawler access is needed |
| SaaS subscriptions / invoices | Upstream hosted Autumn/Stripe | Not Sutra's billing | Build independent billing and metering as a later product workstream; never copy upstream merchant configuration |

Cloudflare Workers Free is limited to 10 ms CPU and 50 external subrequests per request. Source warns that AI Visibility setup can exceed 50. Practical JavaScript-rendered audits require Workers Paid according to self-host docs. DataForSEO, OpenRouter, Google Maps and Context.dev have independent billing/quotas. Google Maps billing is mandatory even within its free usage tier.

## Critical deployment wiring gap

The current .github/workflows/deploy-vetclicklab-selfhost.yml injects only CLOUDFLARE_API_TOKEN and DATAFORSEO_API_KEY. It writes a .env.selfhost containing DataForSEO, AUTH_MODE=password, Workers subdomain and telemetry opt-out. Deploy/alchemy/alchemy.run.ts re-applies secrets and vars on EVERY deploy. Dashboard-entered optional secrets may be overwritten.

Make a separate vetted deployment PR for optional values:
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (Google OAuth, GSC/GA4)
- GOOGLE_MAPS_API_KEY (Google Tiles)
- OPENROUTER_API_KEY, optional model/provider vars (AI workflows/SAM)
- CONTEXT_API_KEY (rendering fallback)
- OPENSEO_OPERATOR_SECRET only if password reset operator feature is needed
- CRAWLER_ACCESS_SECRET only for signed Shopify crawler use
- Optional privacy-approved analytics, only by decision

Protect values in GitHub Actions secrets/vars; no secret echo, PR content, screenshot or telemetry. Preserve the currently generated BETTER_AUTH_SECRET (Alchemy state) and do not rerun initial bootstrap or recreate the production database.

## Ordered repair/release program

**Release A — P0 brand trust / broken routing**
1. Stop upstream one-click agent installs; use genuine Sutra MCP setup. Test connection.
2. Replace owned support destinations after approved values are provided.
3. Replace MCP metadata, OAuth consent/errors, share-preview art and widget labels.
4. Replace active screen copy; add source scanning regression checks.
5. Keep license, internal IDs and upstream attribution intact.

**Release B — P0 core providers**
1. Add optional GitHub/Alchemy secrets as a separate minimal PR.
2. Set up Google Cloud OAuth for GSC and GA4, including authorized callbacks/test users; check provider scopes.
3. Set up Google Map Tiles with billing and daily quota, fix misleading map error text.
4. Confirm DataForSEO balance and vendor response; fund only with explicit approval.
5. Decide an OpenRouter spending limit and whether Workers Paid is justified for AI setup/JS rendering.
6. Decide account recovery and whether self-host needs automated email delivery.

**Release C — End-to-end readiness**
1. Read-only smoke tests across dashboard, data research, integrations and agent tools.
2. Explicitly approved low-cost tests for keyword metrics, SERP, backlinks, map grid, rank schedule, AI visibility.
3. Authenticated browser runs across onboarding, settings, reports, sharing, permissions and mobile.
4. Validate report sharing and team isolation; audit security before any external multi-client SaaS rollout.
5. Add checks: source brand link integrity, configured-provider health checks (non-billable where possible), OAuth callbacks, safe preview links, contrast/a11y, login, smoke tests, and post-deploy health.

**Release D — commercialization only when ready**
Distinct Sutra domain and verified support/legal email, terms/privacy, Google app verification, multi-client tenancy/isolation, billing/metering, dedicated docs and website. The current self-host documentation describes a shared workspace for team users; do not advertise as isolated multi-tenant SaaS without a separate security review.

## QA rules / evidence standard

No claims of fully working without actual proof. Record for each user-facing action: status, test environment, timestamp, screenshot/log, error/fallback, and whether credits were charged. Avoid unnecessary DataForSEO/API charges during implementation. For production: reviewed PR, green CI, manual Cloudflare deployment to main, bootstrap unchecked, health and visual checks. Preserve rollback.

Do not edit original branding in license files or third-party notices. Do not rename infrastructure or auth/OAuth internal IDs without migration. Retain the original app while this audit remains open.

## Key source references

- src/client/features/ai-mcp/agentInstalls.ts
- .agents/skills/setup-openseo/SKILL.md
- src/client/features/dashboard/DashboardAgentCard.tsx
- src/server/mcp/server.ts
- src/server/mcp/oauth-errors.ts
- src/client/mcp-widgets/*
- src/client/lib/support.ts; src/routes/_app/support.tsx
- src/server/features/sam/samSystemPrompt.ts
- src/server/features/sam/openseo-fact-sheet.md
- src/routes/_authenticated.oauth-consent.tsx
- src/routes/s/$token/og[.]png.ts
- src/server/features/google/oauth-config.ts
- src/server/features/local-seo/services/GoogleMapsService.ts
- src/client/features/ai-visibility/AiResearchSetupGate.tsx
- deploy/alchemy/alchemy.run.ts
- .github/workflows/deploy-vetclicklab-selfhost.yml
- docs/GOOGLE_MAPS_SETUP.md; docs/SELF_HOSTING_GOOGLE_SEARCH_CONSOLE.md
- docs/SELF_HOSTING_CLOUDFLARE_OPERATIONS.md

Official constraints: https://developers.cloudflare.com/workers/platform/limits/ ; https://developers.google.com/maps/documentation/tile/usage-and-billing ; https://developers.google.com/maps/billing-and-pricing/pricing ; https://developers.google.com/identity/protocols/oauth2 .
