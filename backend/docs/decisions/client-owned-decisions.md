# R0 client-owned decisions and evidence still required

| Item | Needed from client | Safe engineering work already available |
|---|---|---|
| Cloud allowlist and ceilings | Exact signed AWS manifest, cost cap and approved resource quantities | Plan JSON policy checker and local Compose; no `terraform apply` path enabled |
| CI/deployment path | Approved runner location, network route, deployment role and authorization owner | CI can run repository checks without production credentials |
| EC2 access | Account access and approved hardening/remote-access policy | Local development remains independent of EC2 |
| Staffing/schedule | Named owners, availability, review and acceptance cadence | Task dependencies and draft milestone plan |
| Clinical and finance | Sign-off, screening/clearance, medication billing and correction policies | Schemas and adapters can remain disabled/mocked |
| Call 24 | Live contract, stable IDs/revision rules, credentials and tenant/branch mapping | Supplied CSV preview and durable local import batch |
| Odoo Online | Subscription/version, enabled modules, permissions, endpoint/method evidence and timeout proof | Candidate operation matrix and fail-closed adapter |
| Authentication/device | Cognito/session requirements, actor membership source, device assurance and revocation SLA | Local authorization contract and scope enforcement primitives |
| Imaging | De-identified DICOM examples, viewer decision, retention/size limits and approved object-store controls | Metadata schema and local contract tests |

These are gates: a missing response leaves the affected production behavior disabled or marked pending. No local implementation status should be interpreted as client approval.
