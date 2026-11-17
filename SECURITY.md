# Security & privacy notes

**Prototype:** no server, no real personal data. Don't enter real ID numbers, real phone numbers or payment details.
Enquiries/viewings are stored in the visitor's own browser only. All rendered text is HTML-escaped.

**Production baseline (SRS §12):** HTTPS, secure cookies, CSRF protection, input validation, output encoding, rate limiting,
RBAC with least privilege, immutable audit events for high-risk actions, private evidence storage with logged access,
no raw national ID numbers in general tables, no biometric collection in MVP, retention schedules and deletion workflows.

**AI-assisted development:** all generated code needs human review, automated tests, dependency checks and security checks before deployment.

Report vulnerabilities privately to the repository owner (add a contact email here).
