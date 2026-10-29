# Local and provisional database connection budget

The Compose-only role limits are 18 Clinical, 12 Integrations and 10 Imaging connections (40 aggregate). The remaining 8 connections in the LLD's provisional 48-connection aggregate budget are operational headroom for administration/monitoring. Django reuses healthy connections for up to 60 seconds. These are development guardrails, not an approved RDS sizing recommendation.

Before production, measure peak request concurrency, worker count and connection-pool behavior for the approved RDS class; verify total connections including migrations, monitoring, failover and operator access; then adjust role limits and Django worker/pool sizes together. Do not assume these counts map to a production cost or capacity guarantee.
