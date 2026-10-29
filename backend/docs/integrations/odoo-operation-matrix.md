# Odoo Online operation matrix (candidate methods only)

No Odoo call is enabled by this document. Each cell marked `VERIFY` requires the tenant's installed version, eligible subscription, enabled modules, actual method/permissions, representative-database evidence and timeout reconciliation proof before implementation is switched on.

| Business operation | Candidate model/workflow | Request/reference to verify | Recovery query and success evidence | Gate |
|---|---|---|---|---|
| Customer sync | `res.partner` | Search/create/update and stable Moriton external reference | Search same reference and verify mapped fields | VERIFY |
| Product/stock read | `product.product`, `stock.quant` | Product mapping, location, available quantity semantics | Read product/location and compare stock reservations | VERIFY |
| Prescription reservation | Native `stock.picking` / `stock.move` workflow | Supported single API operation; remote correlation field | Search correlation and inspect reservation state/quantity | VERIFY |
| Physical dispensing | Native delivery/stock movement | Exact validation method, lots/serials and duplicate behavior | Search movement reference and verify quantity/lot/location | VERIFY |
| Return/adjustment | Native return/inventory-adjustment workflow | Link original movement, reason and permission | Search return reference and verify reverse movement | VERIFY |
| Invoice | `account.move` | Draft/post, external references and duplicate handling | Search invoice reference and inspect state/lines | VERIFY |
| Deposit/payment/refund | Native accounting/payment workflow | Allocation, confirmation, refund and authority | Search payment reference and reconcile ledger balance | VERIFY |

For each candidate, capture endpoint/version, method, fields, role permissions, expected state transitions, remote correlation reference, recovery query, negative response behavior, timeout-after-commit result and test evidence. JSON-2 API calls are separate remote transactions; a multi-call flow is not atomic. On an uncertain write, mark `UNKNOWN`, reconcile, and use `MANUAL_REVIEW` if evidence is ambiguous. Never retry a potentially committed write automatically.
