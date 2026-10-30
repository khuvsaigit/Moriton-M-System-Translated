# Legacy backup profile for R1 mapping

Profiled 2026-10-30 from the client-supplied `moriton_full_backup_2026-10-07` JSON. This document contains collection names, counts, field names, and aggregate integrity results only. It intentionally contains no record values, phone numbers, names, notes, or credentials. The backup remains a reference artifact; no rows have been imported into the new databases.

## Collections and observed counts

| Legacy collection | Records | Observed R1-relevant shape |
|---|---:|---|
| `horses` | 2,884 | `name`, `owner`, `phone`, `phone2`, `breed`, `mark`, `age`, `province`, `soum` |
| `waiting` | 0 | Empty in this snapshot; does not establish the live reception workflow |
| `exams` | 2,864 | Horse references plus clinician, diagnosis, symptoms, services, medication, vital-sign and visit-number fields |
| `fins` | 2,883 | Exam reference, services, amount, payment method/state and payment timestamps |
| `inps` | 189 | Exam reference, admission/discharge fields, diagnosis, services, prepayments and log arrays |
| `labs` | 284 | Exam/horse references, service, status, result/history arrays and timestamps |
| `doctors` | 13 | Name, role and revision-related fields; not sufficient to establish current identity-provider accounts |
| `users` | 21 | Name, role, page permissions, lab-edit flag and a `hasPassword` indicator; no account/credential migration attempted |
| `staff` | 6 | Duty/active arrays and dated roster-like records |
| `logs` | 6,614 | Action, actor, target, exam and detail fields; candidate legacy audit evidence |
| `deletedExams` | 22 | Archived exam and related inpatient/finance objects; preserve as historical evidence during migration planning |
| `trips` | 3 | Field-trip location, date, clinician and status fields |

Every sampled record had an `id`, and no duplicate IDs were found within an individual collection. Reference checks found unresolved links in the snapshot: 2 exam-to-horse, 10 finance-to-exam, 2 inpatient-to-exam, and 8 lab-to-exam references. Those records need an exception/reconciliation path during migration; they should not be silently dropped or attached by name/phone.

The export has variable record shapes: 4 distinct horse key sets, 13 exam key sets, 4 finance key sets, 20 inpatient key sets, and 2 lab key sets. Phone fields are mixed strings and numbers across the legacy collections. The new registry therefore treats phones as text/search attributes, never as unique identity keys, and preserves source identifiers separately from the new UUIDs.

## R1 mapping guidance

- Preserve each legacy record ID as a source-system identifier with source collection and import batch provenance; never reuse it as the new domain primary key.
- Keep horse identity and current owner/representative/payer roles separate. Legacy owner and phone values are denormalized and may require staff review before creating `Contact`/`HorsePartyRole` records.
- Maintain independent records for exam/visit, finance, inpatient, and laboratory workflows. A finance or lab row is not proof that its linked clinical record exists or that the related workflow is complete.
- Keep archived/deleted records and log records available for controlled migration review. Do not turn these historical entries into active records automatically.
- Treat user/doctor role and page fields as migration input only. Reconcile them with the client-approved identity provider and current authorization policy before creating memberships.
- Source time-zone conventions, status semantics, update-history rules, and stable identifiers still need confirmation from the client.
