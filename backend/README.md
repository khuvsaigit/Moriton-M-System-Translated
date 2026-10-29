# Moriton P1 backend

Three bounded services: `clinical`, `integrations`, and `imaging`. Each service owns an independent runtime, migrations, logical PostgreSQL database and API release. This repository currently contains the legacy browser/Firebase application; the backend below is a new foundation and does not silently dual-write to it.

## Local development

Install Python 3.12+ and Docker Compose, then run `docker compose -f backend/compose.yaml up --build`. This starts local-only PostgreSQL and service processes. No AWS resources or live vendor calls are configured. The Odoo adapter remains disabled by default.

Compose builds three independent service images with `MORITON_IMAGE_TAG` (default `local`). The legacy static frontend remains at the repository root; do not host it against production Firebase data as part of this local backend stack.

The Clinical service has a provider-neutral server-side session bridge. Mock login is disabled by default; to opt into a local-only demo, set `MORITON_LOCAL_AUTH_ENABLED=1` and configure `LOCAL_AUTH_*` in an untracked local `.env` file. The route is unavailable when `DJANGO_DEBUG=0`; never enable it in staging or production. Identity-provider signature verification and client session policy still need implementation/approval.

Install service dependencies from their individual `requirements.txt` files. Before serving real data, implement Cognito/session verification, branch-scoped authorization and PostgreSQL RLS as required by the LLD.

Call 24 CSV preview/validation: `python -m services.integrations.call24.cli FILE.csv`. It does not write to a database or create bookings. Parent task rows and child call rows are represented separately and linked using source IDs. See `docs/call24-import.md`.

Quality checks are defined in `.github/workflows/backend-quality.yml`. The development requirements include lint, typecheck, pytest, dependency audit and API/event contract validation. After Compose is running, `python backend/tools/postgres_smoke.py` checks database-role isolation and tenant RLS policies.

## Safety gates

Odoo outbound writes, AWS deployment, clinical signing/clearance decisions and imaging viewer claims are disabled pending acceptance evidence. This scaffold is not production ready.
