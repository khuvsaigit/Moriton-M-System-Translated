# API exposure and operational route boundary

The OpenAPI documents under `contracts/openapi` describe business operations that a browser
client may call through the secured application entry point. They are not a list of every
HTTP route in a service.

The following routes and operations are private operational interfaces and are not browser UI
APIs:

- `/health/live` and `/health/ready`, used only by container/orchestrator health probes.
- `/dev/*`, local development setup and debugging routes. These must remain disabled outside
  explicitly approved local development environments.
- `/internal/*`, service-to-service commands and event delivery routes. These require an
  approved service identity and network path; omission from OpenAPI is not network protection.
- Queue consumers, scheduled jobs, and worker commands, which do not accept browser sessions.

Production ingress must enforce the approved CloudFront/ALB and security-group boundary.
Health routes should be reachable by the configured health checker only. Internal routes and
workers must not be reachable through the public browser entry point. Route omission from an
OpenAPI file is documentation, not an access-control mechanism.

Any historical estimate such as 65–85 APIs is a planning estimate only. The approved scope
must count browser-facing operations separately from private operational routes and assign
each operation to Clinical Operations, External Integrations, or Imaging with its permissions,
contract, and data owner.

## Service and frontend boundaries

- The Call24 CSV parser, validation, deduplication, and provider integration belong to External
  Integrations. Clinical Operations receives only a validated reception task through an
  approved versioned contract; it does not process provider files.
- Authorization is enforced by the server for each action and scope. Hiding a page or button is
  a user-experience aid and never grants or denies authority by itself.
- The production frontend target is a React/TypeScript PWA hosted on S3 and CloudFront. The
  current vanilla JavaScript shell is a workflow and visual reference while that frontend is
  rebuilt; it is not the approved production implementation.
- Browser requests use the secured API and controlled refresh/polling where updates are needed.
  Do not reuse Firebase cache or local record merging for clinical data. Any future offline
  field workflow requires its separately approved encrypted synchronization and audit design.
