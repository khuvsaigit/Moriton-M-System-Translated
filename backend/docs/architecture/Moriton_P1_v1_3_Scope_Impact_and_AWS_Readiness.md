# Moriton P1 — v1.3 Scope Impact and AWS Readiness

**Date:** 16 November 2026  
**Inputs:** Client Requirements Confirmed and Pending Clarification; Final Architecture LLD v1.3; AWS Component List and Costs (all dated 15 November 2026); implementation tracker uploaded for this review.  
**Status:** Engineering assessment and proposed provisioning sequence. Client sign-off is still required; this document is not AWS provisioning authorization.

## Executive assessment

The new client documents do **not** require replacing the backend architecture already present in the repository. They retain the three Django/DRF services, their separate PostgreSQL databases, durable operation ledger, SQS messaging pattern, and imaging service. The earlier chat message describing Amplify, API Gateway/Lambda, DynamoDB and Step Functions is superseded for Moriton P1 by the 15 November LLD v1.3 and cost document. A historical repository note that analyzed that earlier pool is now marked superseded.

The architecture correction is therefore small; the remaining scope and release impact is substantial. The requirements document contains 52 confirmed functional requirements, 12 non-functional requirements, 31 pending clarifications (R-P-01–R-P-31), and 10 conflict/decision entries (D1–D10). The final design adds concrete AWS configuration and acceptance evidence, while client rules, vendor access, DICOM samples, budget approval and formal sign-off remain open. The previous eleven-week schedule is not confirmed by v1.3; effort and dates must be re-baselined after Stage A discovery and the Ankesh discussion.

The LLD also assesses 32 optimization points: 8 adopted, 12 conditional, 7 rejected and 5 deferred to P2. It records several material clarified workflow rules: every horse is screened, isolation capacity grows from 2 to 4 stalls, inventory reservation begins at verification while stock deduction is recorded at dispensing, a laboratory partner is in scope, sign-off roles are refined, and the owner document pack has defined contents. These refine the workflow and acceptance criteria; they do not imply that the corresponding application features are already complete.

## What changes in the project

### Architecture and code impact: low

- Keep the current three service boundaries: Clinical Operations, External Integrations and Imaging.
- Keep the Django/DRF/Python service implementation and local Compose/PostgreSQL development path.
- Keep the three service-owned PostgreSQL databases, scoped access/RLS, audit/inbox/outbox foundations, operation ledger, sequence/predecessor checks, and mock-safe vendor adapters.
- Implement the v1.3 AWS deployment target around ECS/Fargate, a shared Multi-AZ RDS PostgreSQL instance with three logical databases, five SQS work queues plus five DLQs, S3, Cognito, CloudFront Pro with WAF/Route 53, Secrets Manager, KMS, CloudWatch/CloudTrail, ECR/CodeBuild, EventBridge Scheduler, SES, GuardDuty Malware Protection for S3, and cross-account AWS Backup/S3 replication.
- Revise the AWS allowlist and Terraform manifest task to match the client’s 31 resource rows / 22 service families. The exact manifest still requires client review and a signed approval ID.

No DynamoDB migration, Lambda rewrite, API Gateway replacement, Step Functions redesign, or Amplify migration is required by the controlling v1.3 documents. Do not implement or provision those components for this scope unless there is a later written change.

### Existing work that remains reusable

Local implementation evidence in the tracker and project history covers the three-service scaffold; Compose/PostgreSQL; service-specific migrations and permissions; organization/branch scoping; audit, inbox/outbox, consumer receipt and operation-ledger foundations; versioned contracts; synthetic Call 24 CSV import through the Clinical reception inbox; horse registry and duplicate-candidate rules; reception and visit foundations; appointment request/confirm/arrival; screening-form storage; stable physical issue identity; and mock Odoo sequencing/reconciliation logic.

The tracker records the 5 November implementation snapshot as **43 Completed, 11 In Progress, and 58 Not Started (112 tasks)**. By release: R0 is 22 complete, 3 in progress and 1 not started; R1 is 11/11 complete; R2 is 7 complete, 2 in progress and 15 not started; R3 is 3 complete, 6 in progress and 11 not started; R4 has 21 not started; R5 has 5 not started; R6 has 5 not started. These are tracker statuses, not client acceptance or production readiness.

### What remains

1. **Architecture and delivery baseline:** close the exact v1.3 approval status, reconcile budget wording, approve the region/account/resource manifest, confirm deployment owner and CodeBuild authorization, and replace old schedule dates/effort with a Stage A estimate.
2. **Client-owned clinical and operating rules:** registration/microchip conflict, roster and assignment rules, screening/emergency paths, isolation monitoring/capacity/release, approval/signature roles, surgery/inpatient/field/lab workflows, charge trigger and dose conversion, departure guards, role matrix, device assurance, Mongolian terminology and retention.
3. **Vendor evidence:** Odoo Online plan/version, sandbox, API rights/methods, remote correlation and timeout/duplicate evidence; Call 24 live auth/schema/stable IDs/timezone and complete export; approved master-data ownership. Until proven, real writes and live feeds remain disabled or manual/CSV-backed.
4. **Imaging evidence:** de-identified representative DICOM objects, modalities/transfer syntaxes/volumes, device import path, viewer review, late-instance/duplicate UID policy, horse/visit link review, URL expiry/revocation, Object Lock and retention policy.
5. **AWS implementation and proof:** signed resource manifest; approved test environment; CloudFront/WAF origin/rate rules; identity/secret/key configuration; scan-clean gate; queues/DLQs and authorized recovery; RDS connection limits; backups/restore; alarms and cost controls. No AWS resources are evidenced as provisioned in the project history reviewed.

### Cost/budget reconciliation required

The AWS cost sheet labels **$441.01/month** as confirmed P1 scope while the requirements register still marks budget approval pending and the LLD requires a signed exact manifest. Treat $441.01 as the estimate for the listed baseline, not as approved spend. The displayed component rows sum to **$441.02**, a $0.01 discrepancy that should be corrected in the source estimate. C1–C5 add $151.57, producing $592.58; C6–C7 add $281.59, producing $874.17. C8–C12 are separately priced options beyond that stated envelope, so $874.17 is not an all-options maximum. Odoo Online ($153–$192/month) is outside AWS.

## AWS provisioning sequence for the next 2–3 weeks

Provision only after the client signs the exact Terraform manifest, budget ceiling, account and region. Work that does not require AWS—domain logic, local schemas, contracts, mocks and synthetic tests—can continue on the existing local Compose stack while approval is pending. The CloudFront Pro/WAF, resource counts and cost values below are the v1.3 proposal, not approval to apply them.

### Stage 0 — approval and access (before any apply)

1. Confirm whether Seoul (`ap-northeast-2`) satisfies data-residency requirements; confirm the client AWS account and ownership contacts.
2. Sign the exact resource manifest with resource types, names, counts, region, policies, retention, costs, Terraform plan hash and approval ID. Resolve the $0.01 component-total discrepancy and obtain a budget decision.
3. Confirm the client-account CodeBuild role, ECR access, deployment approver and network access. The v1.3 design specifies CodeBuild in the client account; external shared runners do not access client resources.
4. Confirm whether a hosted staging/UAT environment is required. C1 is conditional at about $96.03/month; do not include it by default.

### Week 1 — controlled build/deploy foundation

1. Establish the approved VPC/subnet/security-group layout across two AZs, one NAT Gateway and the S3 Gateway endpoint. Validate that ALB/API ingress is limited to CloudFront and document the stated single-NAT AZ-failure limitation.
2. Create the four ECR repositories and client-account CodeBuild project(s), IAM task/build/deploy roles, and Terraform allowlist/plan-hash approval gate. Keep deployment identity short-lived and least-privilege.
3. Establish KMS keys and Secrets Manager references for the service database roles, Odoo, Call 24 and JWT signing material. Do not populate live vendor secrets until owners authorize the sandbox and rotation procedure.
4. Configure CloudTrail management-event logging, CloudWatch log groups/alarms/metrics and SES identity only for approved staff alerts. Keep application audit in the service databases.

### Week 2 — database, edge, identity and messaging

1. Create the proposed Multi-AZ `db.t4g.medium` PostgreSQL instance, 100 GB gp3 storage, 35-day PITR, service databases and separate DB roles. Validate the provisional 48-connection budget before loading application traffic.
2. Configure Cognito OIDC/PKCE and server-side sessions, then test scoped service authorization and revocation in non-production.
3. Create the CloudFront Pro distribution with the React S3 origin, `/api` ALB origin, bundled WAF managed/rate rules, Route 53 and ACM. Test that direct ALB access is denied and the authenticated Call 24 ingress is not accidentally blocked.
4. Create the six S3 buckets with approved encryption, access and lifecycle rules; configure versioning/Object Lock for originals only after retention/legal approval. Enable GuardDuty Malware Protection on quarantine and prove that processing is blocked until the exact object version is tagged clean.
5. Create the five work queues and five DLQs, queue IAM policies, per-operation visibility/retry settings and CloudWatch DLQ alarms. Add the single EventBridge Scheduler sweep only after the sweep behavior and permissions are approved.

### Week 3 — service deployment, recovery and imaging proof

1. Deploy the Clinical API/worker, Integrations ingress/worker and Imaging urgent/bulk task definitions under the approved Fargate caps. Imaging bulk uses Spot with no On-Demand fallback; urgent imaging is staffed-hours only unless C2 is approved.
2. Verify database migrations, independent deployability, RLS/cross-service denial, task-role least privilege, CloudFront-only ALB access, secrets retrieval and rollback.
3. Configure AWS Backup cross-account RDS snapshot copy and S3 originals replication, then perform a restore/reconciliation rehearsal. Keep Odoo writes paused after restore until remote operations reconcile.
4. Test SQS duplicate/out-of-order/crash behavior, DLQ alarm and operator-only redrive; test ambiguous Odoo timeout remains `UNKNOWN` and is never auto-replayed.
5. With client-provided de-identified samples, verify upload → quarantine → GuardDuty clean tag → exact original archive/checksum → non-diagnostic derivative → authorized short-lived CloudFront view grant. Obtain clinician review before claiming viewer acceptance.

### Keep conditional until the trigger is approved

- C1 hosted UAT/staging: about $96.03/month.
- C2 24/7 urgent imaging: +$12.23/month.
- C3 third Clinical API task: up to +$20.72/month.
- C4 additional Call 24 ingress task: +$10.36/month.
- C5 additional Integrations worker: +$12.23/month.
- C6 RDS read replica: about $87.56/month; C7 RDS upsize: +$194.03/month.
- C8 second NAT: +$46.72/month; C9 SMS is volume-based; C10 direct modality receiver about $68/month (clinic gateway PC is the $0 AWS alternative); C11 historical imaging is about $30.72/TB-month; C12 each additional 100 GB RDS gp3 is about $26.20/month.

## Draft email for Ankesh

**Subject:** Moriton P1 v1.3 review — implementation impact, open items and AWS sequence

Hi Ankesh,

I reviewed the three documents shared on 15 November against the current repository and the task tracker. The main architecture correction is limited: the earlier discussion of an Amplify/API Gateway/Lambda/DynamoDB/Step Functions pool is superseded by the client’s v1.3 documents. Those documents retain the existing three-service Django/DRF direction with ECS/Fargate, separate Clinical/Integration/Imaging PostgreSQL databases on shared Multi-AZ RDS, SQS/DLQs, S3, Cognito, CloudFront Pro/WAF, Secrets Manager, KMS, GuardDuty malware scanning, CloudWatch/CloudTrail, CodeBuild/ECR, EventBridge Scheduler, SES and cross-account backup. The current local service/database foundations therefore remain reusable; no serverless rewrite is indicated.

The delivery scope still needs meaningful reconciliation. The requirements register has 52 confirmed functional requirements, 12 non-functional requirements, 31 pending clarifications and 10 conflict/decision entries. The tracker snapshot dated 5 November records 43 of 112 tasks complete, 11 in progress and 58 not started; R1 is complete in the tracker, while R2 and R3 remain in progress. This is implementation evidence only, not client acceptance. The v1.3 LLD says to re-estimate after Stage A, so I have not treated the former 11-week dates as a confirmed commitment.

The main remaining dependencies are the exact signed AWS manifest and budget/region decision; final clinical, finance, device and retention rules; Odoo Online sandbox/API/timeout evidence; live Call 24 authentication, stable identifiers and data semantics; and de-identified DICOM samples plus clinician viewer review. Until those are supplied and approved, cloud provisioning, real Odoo writes, production Call 24, clinical clearance/signing, automated billing/departure guards and diagnostic viewer claims should remain gated.

The AWS cost sheet calls $441.01/month the confirmed P1 baseline, but the requirements document still says budget approval is pending and all resources require a signed manifest. The displayed cost rows add to $441.02, so there is also a $0.01 arithmetic discrepancy to reconcile. C1–C5 bring the estimate to $592.58 and C6–C7 to $874.17; C8–C12 are additional priced options outside that stated envelope. Odoo Online is separate.

For the next 2–3 weeks I recommend: first approve the exact resource manifest, region/account and spend ceiling; then provision the client-account CodeBuild/ECR/IAM and network foundations; next RDS, Cognito, CloudFront Pro/WAF, S3/GuardDuty, Secrets/KMS and the five queues/DLQs; and finally deploy the three service task groups and validate backup/restore, queue recovery and the DICOM quarantine/view flow with approved samples. A hosted UAT environment, after-hours imaging, database scaling and direct modality receiver remain conditional cost items. Local development can continue without these AWS resources.

Please confirm that v1.3 is the implementation baseline, whether the $441.01 baseline and conditional-cost scenarios are approved, who owns the Stage A decisions listed above, and when we can review the revised effort and release dates together. After that discussion, I can proceed with coding against the agreed scope and re-baseline the tracker.

Regards,

Moriton P1 delivery team
