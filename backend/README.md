# Moriton P1 backend

Three bounded services: `clinical`, `integrations`, and `imaging`. Each service owns an independent runtime, migrations, logical PostgreSQL database and API release. This repository currently contains the legacy browser/Firebase application; the backend below is a new foundation and does not silently dual-write to it.

## Local development

Install Python 3.12+ and Docker Compose, then run `docker compose -f backend/compose.yaml up --build`. This starts local-only PostgreSQL and service processes. No AWS resources or live vendor calls are configured. The Odoo adapter remains disabled by default.

Compose builds three independent service images with `MORITON_IMAGE_TAG` (default `local`). The legacy static frontend remains at the repository root; do not host it against production Firebase data as part of this local backend stack.

The Clinical service has a provider-neutral server-side session bridge. Mock login is disabled by default; to opt into a local-only demo, set `MORITON_LOCAL_AUTH_ENABLED=1` and configure `LOCAL_AUTH_*` in an untracked local `.env` file. The route is unavailable when `DJANGO_DEBUG=0`; never enable it in staging or production. Identity-provider signature verification and client session policy still need implementation/approval.

### Local frontend-to-backend preview

The legacy `index.html` app still uses Firebase. To exercise the new Clinical horse API without touching Firebase, use the separate `backend-preview.html` page. Set these values in the untracked `backend/.env` file for a throwaway local identity:

```dotenv
MORITON_LOCAL_AUTH_ENABLED=1
MORITON_FRONTEND_ORIGIN=http://localhost:5500
LOCAL_AUTH_ACTOR_ID=11111111-1111-4111-8111-111111111111
LOCAL_AUTH_ORGANIZATION_ID=22222222-2222-4222-8222-222222222222
LOCAL_AUTH_BRANCH_ID=33333333-3333-4333-8333-333333333333
LOCAL_AUTH_ROLE=Local Demo
LOCAL_AUTH_PERMISSIONS=registry.read,registry.create,visit.create,pharmacy.read,pharmacy.prescribe,pharmacy.verify,pharmacy.dispense,pharmacy.administer
```

Start the backend with `docker compose --env-file backend/.env -f backend/compose.yaml up -d --build`, then serve the repository root in another terminal with `python3 -m http.server 5500 --bind 127.0.0.1`. Open `http://localhost:5500/backend-preview.html`, connect the local demo session, and try horse → visit → draft prescription → verification → partial issue → administration. Stop the backend with `docker compose --env-file backend/.env -f backend/compose.yaml down` (do not add `-v` if you want to keep the local database volume).

The preview only reads and writes the local Clinical database. The mock session expires after ten minutes. Verification does not reserve Odoo stock, physical issue records do not post remotely, and medication administration does not create another stock movement. This is a development integration slice, not the production login or the full clinical registration flow; owner/reception linking, approved correction handling, billing policy and legacy Firebase migration are not wired to this page.

Install service dependencies from their individual `requirements.txt` files. Before serving real data, implement Cognito/session verification, branch-scoped authorization and PostgreSQL RLS as required by the LLD.

Call 24 CSV preview/validation: `python -m services.integrations.call24.cli FILE.csv`. It does not write to a database or create bookings. Parent task rows and child call rows are represented separately and linked using source IDs. See `docs/call24-import.md`.

Quality checks are defined in `.github/workflows/backend-quality.yml`. The development requirements include lint, typecheck, pytest, dependency audit and API/event contract validation. After Compose is running, `python backend/tools/postgres_smoke.py` checks database-role isolation and tenant RLS policies.

## Safety gates

Odoo outbound writes, AWS deployment, clinical signing/clearance decisions and imaging viewer claims are disabled pending acceptance evidence. This scaffold is not production ready.
