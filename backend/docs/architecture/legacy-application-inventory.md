# Existing application inventory and reuse register

Audit date: 2026-10-29. Source inspected in the current working tree; commit-specific approval and export permissions are still required before migration.

| Existing files | Current responsibility | Reuse assessment for P1 |
|---|---|---|
| `index.html`, `style.css`, `app.js` | Static single-page clinic workflow, shared browser state, horse/visit/exam screens and local persistence | UI ideas and terminology can inform the new frontend. The global mutable state and localStorage persistence are not a backend data layer. |
| `firebase.js`, `firebase.json`, `storage.rules`, `.firebaserc` | Firebase initialization, Firestore reads/writes, Auth/Storage integration and deployed rules/config | Do not copy project credentials or assume current rules satisfy the new service authorization model. Require client-approved data export, access and migration review. |
| `lab.js` | Lab orders, sample collection, result files and workflow UI | Reuse terminology and workflow observations only; persist through the approved Imaging/Clinical contracts after review. |
| `pharmacy.js` | Medicine catalog, prescriptions/courses, dispensing interactions and usage summaries | UI/business vocabulary only. No live stock/billing behavior may be copied as authoritative without approved policy and Odoo proof. |
| `dailyreport.js`, `timesheet.js`, `REPORT-README.md` | Daily clinical summary and staff/timekeeping reports | Reference for report fields and Mongolian labels; verify calculations and access rules before migration. |
| `pwa.js`, `sw.js`, `manifest.json` | Installable PWA shell, service worker and static asset caching | Can inform offline UX; service-worker caching must be reviewed before any authenticated clinical data is cached. |
| `Moriton-M-System-Translated.zip` | Packaged source snapshot | Treat as a source artifact only; it is not an approved migration or dependency lockfile. |

## Inventory limitations

- No Node package manifest or lockfile is present; Firebase client libraries are loaded from versioned Google CDN URLs in `firebase.js`.
- The frontend is plain browser JavaScript, not a typed React/TypeScript project.
- The checked-in Firebase web configuration contains public client configuration, not a server credential. This is not a substitute for reviewing Firebase Security Rules and project IAM in the client account.
- This repository inspection cannot establish production Firestore contents, rule deployment state, enabled APIs, backups, or export permission.
- The current application contains sensitive clinical and operational workflows; reuse requires source owner approval, data mapping, and clinical/finance acceptance.
