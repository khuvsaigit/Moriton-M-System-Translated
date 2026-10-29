# R0 engineering progress

As of 2026-10-29, the local R0 engineering tasks MP1-001 through MP1-026 have implementation evidence, except for the explicitly client-dependent AWS allowlist approval, deployment runner policy, staffing confirmation, and supplied EC2 access. The detailed task tracker remains the status source of record.

## Verified implementation evidence

- Three-service ownership and data boundaries documented; service-specific Dockerfiles and local image tags build.
- Three isolated PostgreSQL logical databases run locally. Service-role tests confirm each role can connect only to its own database and connection ceilings are configured.
- PostgreSQL smoke checks confirm row-level security is enabled and forced on scoped tables, rows are hidden without matching organization/branch scope, and audit UPDATE attempts are rejected by append-only triggers.
- Concurrent PostgreSQL worker smoke test confirms competing workers do not duplicate-claim or overtake a predecessor; an unknown/expired write is not replayed automatically.
- Per-service Django migrations apply; OpenAPI and JSON event/security contracts validate; schema and migration checks pass.
- `ruff`, selected-module `mypy`, service test suites (clinical 8, integrations 10, imaging 2), Terraform policy/secret-scan unit tests (5), and repository secret scan pass.
- Dependency audit on 2026-10-29 reports no known vulnerabilities in the development requirements. Package license metadata and provenance are inventoried in `python-license-inventory.md`.
- Clinical session/RBAC/scope bridge, Call 24 CSV batch persistence, durable integration operation sequencing, and imaging DICOM metadata structures are implemented behind the agreed disabled or local-only boundaries.
- The supplied Call 24 September export parses as 158 rows, 75 requests, and 83 child calls, with 0 unmatched calls and 0 validation issues; this validates the sample CSV only, not a live API or stable-ID contract.
- Local Compose health endpoints for Clinical, Integrations, and Imaging return HTTP 200. Odoo writes and production authentication are disabled.

## Client-owned gates still open

- AWS owner: approve the exact resource allowlist, counts, cost ceiling, network and storage plan before cloud deployment.
- Client security/IT: confirm runner placement, deployment identity/network authorization, and provide approved EC2 access before hardening it.
- Sponsor/PM: provide named team capacity, availability, and sign-off cadence before treating the 11-week schedule as committed.
- Other vendor, clinical, finance, device, and imaging evidence remains tracked in `Client Gates`; no production Odoo, clinical clearance, billing, or imaging-store action is enabled by these R0 local results.

The completed work is a local R0 engineering foundation. It does not indicate a client-approved cloud deployment or release acceptance.
