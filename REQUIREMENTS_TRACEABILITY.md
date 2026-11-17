# Requirements traceability (prototype vs SRS v1.0)

Legend: ✅ demonstrated in prototype · 🟡 partial/simulated · ⛔ needs backend (not in static prototype)

| ID | Requirement (short) | Status | Notes |
|---|---|---|---|
| AUTH-01…04 | Registration, OTP, reset, role approval | ⛔ | Role switcher simulates sessions. Use a managed auth provider. |
| SRCH-01 | Only published, unexpired, non-suspended listings | ✅ | `isPublic()` in `script.js` |
| SRCH-02 | Kenyan estate names & spelling variants | 🟡 | Alias map + edit-distance ≤1. Production: Postgres trigram/PostGIS + curated gazetteer |
| SRCH-03 | Combined filters reflected in URL | ✅ | Hash query params |
| SRCH-04 | Stable sort, no duplicate pagination | ✅ | Tie-break on ID |
| SRCH-05 | Map view | 🟡 | Approximate-area placeholder; provider chosen after cost test |
| SRCH-06/07 | Bounded pages, empty state + reset | ✅ | 6 per page |
| LIST-01…04 | Draft, fields, location hierarchy, unknown values | ✅ | Wizard + "Not provided" |
| LIST-05 | Photo validation | 🟡 | Type/size/count validated client-side; no upload |
| LIST-06/07 | Moderation statuses; material-edit re-review | 🟡 | Statuses ✅; edit-after-publish flow not built |
| LIST-08 | Reconfirm every 14 days | ✅ | Label at 14 days, auto-hide at 21 |
| LIST-09 | Duplicate detection | 🟡 | Moderator risk flags only; no similarity engine |
| LIST-10 | Pause / let / off-market | ✅ | |
| VER-01…06 | Separate badges, dates, expiry, audit | ✅ | Definitions in `VERIFY` constant |
| VER-03 | Private evidence storage | ⛔ | Backend: private bucket + signed URLs |
| VER-07 | No biometrics | ✅ | None collected |
| COMM-01…04 | Enquiry, notification, viewing request/response | 🟡 | Stored locally; email delivery simulated |
| COMM-05/06 | Contact disclosure control, safety guidance | ✅ | |
| SAVE-01/02 | Save/unsave, unavailable status | ✅ | |
| ALERT-01 | Alerts | ⛔ | COULD |
| SAFE-01…04 | Report, case ref, moderator actions, SLA view | ✅ | |
| SAFE-05 | Appeals | ⛔ | |
| ADM-01…03 | Queues, audit log, metrics | ✅ | Audit log is local only |
| ADM-04 | No-code config | ⛔ | |
| NFR Accessibility | WCAG 2.2 AA aim | 🟡 | Needs formal audit (axe + manual screen-reader test) |
