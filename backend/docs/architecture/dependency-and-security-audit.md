# Dependency and browser security audit

Audit date: 2026-10-29.

- Backend dependencies are declared per service. `python-license-inventory.md` records package versions, license metadata, and project links from the current development environment; regenerate it from a pinned release environment before distribution. Exact lockfiles remain required before a production build.
- The legacy browser client has no npm manifest/lockfile. Firebase modules are fetched from Google CDN at version 11.0.2; source and license provenance must be captured if the client is vendored or redistributed.
- Repository pattern scan found no committed private-key block or AWS access-key pattern. The Firebase browser configuration is public client configuration; access control depends on Firebase Auth and deployed Firestore/Storage rules, which cannot be verified from this checkout.
- No production credentials should be placed in the Compose file or committed environment templates. Current local Compose credentials are development-only placeholders.
- Production use remains gated on dependency lock/SBOM and license review, secret scanning in CI/history, Firebase rule review, and client approval of the migration/export path.

The local `pip-audit` run on 2026-10-29 found no known vulnerabilities in `backend/requirements/dev.txt`. This is a repository-level and current-environment audit, not a penetration test, Firebase configuration review, legal license approval, or assurance that historical Git objects contain no secrets.
