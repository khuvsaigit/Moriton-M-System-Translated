# Moriton P1 service ownership map

| Service | Owns | Does not own | Local project evidence |
|---|---|---|---|
| Clinical Operations | Identity-to-scope authorization decision, horse registry, reception, visits, clinical record and approval history | Vendor credentials, Odoo state, original DICOM bytes | `services/clinical/registry`, `contracts/openapi/clinical-v1.yaml` |
| External Integrations | Call 24 source intake, vendor adapters, external operation ledger, inbox/outbox and remote reconciliation | Clinical authority or final patient identity; production clinical rules | `services/integrations/call24`, `services/integrations/ledger`, `services/integrations/odoo` |
| Imaging | DICOM ingest and immutable object metadata, study/series/instance indexing, viewer access grants | Clinical identity resolution or source DICOM mutation | `services/imaging/imaging` |

Each service owns its schema and migrations in its own logical PostgreSQL database. They may exchange versioned events and API calls; they may not read or write another service's tables. Local Docker Compose uses one PostgreSQL server with three isolated databases solely to reduce development setup cost. Production database topology and AWS resource counts remain client approval gates.

## Decisions that remain external

- Approved client AWS resource manifest, cost ceilings, runner placement and production access path.
- Odoo Online entitlement, installed version, supported operations and duplicate/timeout evidence.
- Call 24 live API identity, stable source event semantics and tenant routing.
- Clinical/finance policy approvals and device assurance level.
- Imaging source formats, viewer acceptance and retention/cost limits.

This map records the implementation boundary. It is not evidence that a vendor or production integration is approved.
