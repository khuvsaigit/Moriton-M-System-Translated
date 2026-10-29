# ADR-001: Three independently deployable services

- Status: accepted as the implementation baseline; production topology remains gated.
- Date: 2026-10-29.

## Decision

Keep three independently buildable Django/DRF services: Clinical Operations, External Integrations, and Imaging. Each service owns its API, migrations and data in its assigned logical database (`clinical_db`, `integration_db`, `imaging_db`). Cross-service workflows use versioned messages or APIs, with durable inbox/outbox and operation records. No application service imports another service's ORM models.

For local development, the three databases may share one PostgreSQL server in Docker Compose. This does not approve shared production credentials, database access, AWS provisioning, or deployment topology beyond the three ownership boundaries.

## Consequences

- Domain contracts and database ownership are visible in this repository before feature work expands.
- Cross-service consistency is eventual and must use correlation, idempotency, sequencing and reconciliation.
- Local Compose does not prove production isolation, scale, cost, IAM or recovery behavior.
- Client approval and observed vendor methods remain required before production integrations are enabled.

## Alternatives considered

- A single shared application/database would undercut the approved three-service boundary.
- Nine small services would add operational overhead without approved service boundaries.
- Independent production database servers are deferred pending the client's signed AWS allowlist and cost decision.
