# Architecture

## Prototype (this repo)
Single-page app with a hash router (`#/search`, `#/listing/l1`, …), so it works on GitHub Pages without server rewrites.

```
index.html ─┬─ style.css
            └─ script.js
                 ├─ Reference data (VERIFY definitions, estates, aliases)
                 ├─ Seed data (agents, listings, reports)
                 ├─ State  → localStorage ("nyumbaloop_v1")
                 ├─ Domain logic (isPublic, badgesFor, matchText)
                 ├─ Views (vHome, vSearch, vListing, vDashboard, vAdmin …)
                 └─ Actions (data-act delegation) + modals
```
All user-supplied text is passed through `esc()` before rendering. To reset demo data, clear site data for the page
(or run `localStorage.removeItem('nyumbaloop_v1')`).

## Target production architecture (SRS §9–11)
Modular monolith: identity, listings, search, messaging, verification, moderation, billing.

| Layer | Choice |
|---|---|
| Web | Next.js + TypeScript, Tailwind |
| API | Next.js route handlers (extract later if needed) |
| DB | Managed PostgreSQL (+ PostGIS if geo search needed) |
| Auth | Managed provider; RBAC enforced server-side |
| Files | Public bucket for listing media; **separate private bucket** for verification evidence with short-lived signed URLs |
| Email / SMS | Transactional email; Africa's Talking for OTP only where needed |
| Ops | Error tracking, uptime monitoring, structured logs, GitHub PR workflow |

### Mapping prototype → production
| Prototype | Production |
|---|---|
| `SEED_LISTINGS` / localStorage | PostgreSQL tables per SRS §9 |
| `badgesFor()` | Verification service reading `verification_checks` with expiry |
| `actions.*` | REST endpoints per SRS §10, with permission checks and audit events |
| `audit()` | Append-only audit table (no UPDATE/DELETE grants to the app role) |
| Role `<select>` | Session + RBAC |
