# Roadmap

Based on SRS §2, §18 and §21. Scope changes go through a change log that assesses cost, legal, security and release impact.

## Release 0: prototype (this repo)
Validate flows and language with real renters, agents and moderators in the Nairobi pilot neighbourhoods.

## Release 1: MVP (build only what's validated)
Accounts + OTP, real listings CRUD with image pipeline, search (Postgres), enquiries and viewings with email, verification operations with private evidence storage, report/moderation, admin console and audit, English first with Swahili-ready content.

## Release 2+: deferred (needs legal/vendor review first)
M-Pesa deposits/escrow, card/bank checkout, biometric KYC (only if justified, DPIA/ODPC), IPRS integration (only if authorised).

## Release 3
Mortgage partner flows, 360° tours, commute estimator, specialist title-verification workflow.

## Excluded until evidence exists
Neighbourhood safety score.

## Before going live
- [ ] Kenyan legal adviser approves terms, privacy notice and estate-agency controls
- [ ] Data Protection Act 2019 obligations reviewed (registration, DPIA where needed, processor agreements)
- [ ] Security review (OWASP), dependency scanning, backup/restore test
- [ ] Accessibility audit (WCAG 2.2 AA key journeys)
- [ ] Moderation staffing and SLA (24h on reports in staffed hours)
