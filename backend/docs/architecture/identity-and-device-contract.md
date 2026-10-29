# Identity, queued authorization and device contract (draft)

The Clinical Operations Service is the authorization decision point. Identity provider verification is an adapter and stays disabled until the client selects Cognito/session behavior. A request scope must contain actor, organization, branch, membership policy version and a verified authentication time. Client-provided organization/branch values are never authoritative.

Before executing a queued privileged command, re-read active membership, role/action permission, organization/branch scope, policy version, device status and command expiry. A mismatch moves the command to `AUTH_REVALIDATION_PENDING`; it is not sent to an external service. Authorized physical facts that already occurred must still be recorded and routed to reconciliation after a revocation; do not erase or fabricate the action.

WebAuthn enrollment stores credential ID, public key, signature counter, transports, status and enrollment/revocation times. Registration requires explicit user and administrator ceremony. Revocation invalidates grants on the next server-side permission check. Short-lived field grants bind actor, device, organization, branch, permission and expiry. Browser fingerprinting is not device proof. WebAuthn proves possession of a credential, not necessarily possession of managed hospital hardware; managed-device certificates/attestation remain a client choice.

Implementation code contains testable scope, permission-version, expiry and queued-command decisions plus registry tables. It does not create a production login, trust client-supplied scopes, or claim managed-device assurance. The identity provider, administrator enrollment rules and revocation SLA remain client decisions.
