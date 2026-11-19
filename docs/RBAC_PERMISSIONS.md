# VisitPass role-based access control (RBAC)

Roles are assigned to staff accounts by an organization admin. The role chosen on the login screen is only a consistency check: the server compares it with the saved account role and rejects a mismatch. API authorization uses the authenticated account loaded from the database, not a client-provided role.

| Capability | Admin | Security | Frontdesk | Employee |
|---|---:|---:|---:|---:|
| View organization dashboard totals | Yes | Yes | Yes | No; only own pending appointment count |
| Register a visitor and issue a pass | Yes | No | Yes | No |
| Browse/search visitor directory | Yes | Yes | Yes | No |
| Verify a pass | Yes | Yes | Yes | No |
| Check visitors in/out | Yes | Yes | Yes | No |
| Revoke a pass | Yes | No | Yes | No |
| Create appointment request | Yes | No | Yes | Yes |
| View appointment queue | Yes | No | Yes | No; own requests only |
| Approve/reject appointments | Yes | No | Yes | No |
| View check logs | Yes | Yes | Yes | No |
| Delete pass after checkout | Yes | No | No | No |
| Export visitor CSV | Yes | No | No | No |
| Create/disable staff accounts | Yes | No | No | No |

## Enforcement notes

- Protected API groups require a valid bearer token.
- Restricted routes use server-side `allowRoles(...)` guards and return HTTP 403 for insufficient roles.
- Appointment list queries are organization-scoped; employee accounts are additionally scoped to `requestedBy`.
- Employee dashboard counts do not expose organization-wide visitor statistics.
- Frontend navigation and action buttons mirror the server permissions for usability, but backend guards remain authoritative.

Run backend tests from `server/` with `npm test` after installing dependencies. Also perform a manual smoke test with one account per role before deployment.
