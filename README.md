# NyumbaLoop – Kenya Property Discovery Platform (MVP prototype)

<p align="center"><img src="assets/brand/nyumbaloop-brand-mark.png" alt="NyumbaLoop: Find. View. Move in." width="520"></p>

> **Find. View. Move in.** Accurate listings. Accountable advertisers. Clear information. Safer house hunting.

A mobile-first, web-first rental marketplace prototype for Nairobi, built from the
[SRS v1.0](docs/Kenya_House_Hunting_App_SRS.docx) and the
[NyumbaLoop brand and implementation proposal v2.0](docs/NyumbaLoop_Brand_and_Implementation_Proposal_v2.docx) (17 Nov 2026).
**NyumbaLoop is a working name, subject to KIPI trademark, domain and social-handle clearance** (see [docs/BRAND.md](docs/BRAND.md)).
This repo is a **static front-end** (HTML, CSS, vanilla JS) that runs on GitHub Pages. Sample data and
`localStorage` stand in for the backend, so the product flows can be demoed and validated before any
backend spend (the SRS "lean budget" posture).

**Live demo:** `https://<your-username>.github.io/<repo-name>/`

## Quick start

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
python3 -m http.server 8000      # or any static server
# open http://localhost:8000
```
Opening `index.html` directly also works.

## What's in the prototype

| Area | Features | SRS IDs |
|---|---|---|
| Discovery | Property types incl. single and shared rooms for students; search by estate/town/keyword with typo tolerance (e.g. "kilimni", "sth b"), filters (type, KES range, furnished), sort, pagination, empty state with one-click reset; filters live in the URL | SRCH-01…04, 06, 07 |
| Listing page | Price, deposit terms, utilities with "Not provided" for unknowns, approximate location only, last-confirmed date | LIST-02…04 |
| Trust | Five separate badges (Phone verified, Identity checked, Authority reviewed, Property visited, Availability confirmed), each with date, expiry and "what it does NOT mean"; no generic "100% verified" | VER-01…06 |
| Availability | Unconfirmed label after 14 days; hidden after 21 days | LIST-08, LIST-10 |
| Enquiries & viewings | Validated forms (Kenyan mobile format), honeypot and rate limit, contact hidden until the user chooses to reveal, safety guidance | COMM-01…06 |
| Saved | Save/unsave, "No longer available" state | SAVE-01, 02 |
| Reporting | Report listing/advertiser, case reference, moderation queue with SLA indicator | SAFE-01…04 |
| Advertiser dashboard | Create-listing wizard (3 steps, photo validation), statuses, pause/mark let/reconfirm, answer viewing requests | LIST-01…07, 10, COMM-03/04 |
| Moderation console | Approve / request changes / reject with mandatory reason, risk flags, expiring verifications, append-only audit log, metrics | ADM-01…03, VER-04, SAFE-03 |
| Audiences | Student, professional, family and diaspora entry points; advertiser “List your property” landing page | Brand §3 |
| Accessibility | Skip link, labelled forms, focus rings, keyboard-operable, dark mode, reduced motion | NFR |

Use the **role switcher** in the header (Visitor / Renter / Agent / Moderator) to walk through the journeys in SRS §6.
Roles here are a demo convenience only. Real RBAC must be enforced server-side.

## Project layout

```
index.html           App shell
style.css            Design tokens, layout, components (light/dark)
script.js            Router, sample data, views, actions, localStorage state
404.html             Redirects unknown URLs home
assets/              Logo mark (SVG), favicon, original brand mark PNG
docs/                SRS, architecture, requirements traceability, roadmap, deployment, security
.github/workflows/   GitHub Pages deployment
```

## Deploy on GitHub Pages

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Short version: push to `main`, then
**Settings → Pages → Source: GitHub Actions** (or "Deploy from a branch → main / root").

## What this prototype is not

- Not a production system: no real accounts, emails, SMS, payments, file uploads or database.
- Not legal advice. Terms and privacy pages are placeholders pending review by a Kenyan legal adviser.
- No deposits/escrow, biometric KYC, IPRS integration, safety scores or title verification (explicitly deferred in SRS §2.2).

## Next steps

See [docs/ROADMAP.md](docs/ROADMAP.md). The SRS recommends Next.js + TypeScript, managed PostgreSQL and a managed
auth provider for the real build. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

MIT. See [LICENSE](LICENSE). Sample listings, names and numbers are fictional.
