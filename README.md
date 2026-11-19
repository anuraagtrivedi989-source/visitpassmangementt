# VisitPass — MERN Visitor Pass Management System

A structured college-project implementation for digital visitor registration, appointment approvals, QR passes, check-in/check-out, audit logs, role-based access, tenant isolation, and CSV reporting.

## Stack
- **Client:** React 18 + Vite single-page dashboard, `html5-qrcode`, `qrcode`
- **API:** Node.js (ES modules) + Express
- **Database:** MongoDB + Mongoose
- **Security:** bcrypt password hashing, JWT sessions, login rate limiting, Helmet, role middleware, organization-scoped queries
- **Passes/reports:** QR generation, PDF badge endpoint (PDFKit), CSV export
- **Notifications:** optional SMTP email (Nodemailer) and Twilio SMS; disabled until credentials are configured

## Prerequisites
- Node.js 20+ and npm
- MongoDB local, or a MongoDB Atlas database

## 1. Configure the API
```bash
cd server
copy .env.example .env
npm install
```
On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Edit `.env`: set a MongoDB connection string and a long random `JWT_SECRET`. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (minimum 10 characters). `ORG_NAME` and `ORG_SLUG` define the organization used by the seeded admin.

Create/update the organization and initial admin:
```bash
npm run seed:admin
```
Start the API:
```bash
npm run dev
```
Health endpoint: `http://localhost:5000/api/health`.

## 2. Start the client
Open a second terminal:
```bash
cd client
copy .env.example .env
npm install
npm run dev
```
The default client URL is `http://localhost:5173`. `VITE_API_BASE_URL` can point to the API URL when deployed.


## Frontend folder structure (refactored)

The React UI is split by responsibility instead of keeping all page markup in `client/src/App.jsx`.

```text
client/src/
├── App.jsx                    # App state, API orchestration, active page selection
├── main.jsx                   # React entry point
├── styles.css                 # Global styles and responsive layout
├── components/
│   ├── auth/AuthPage.jsx      # Login and organization registration forms
│   ├── layout/AppLayout.jsx   # Sidebar, page header, alerts and sign out
│   └── visitors/
│       ├── PassDetails.jsx    # Digital pass and QR display
│       └── VisitorTable.jsx   # Reusable visitor table
├── hooks/
│   ├── useQrCode.js           # Generates QR data URL for a selected pass
│   └── useQrScanner.js        # Manages camera QR scanner lifecycle
├── pages/
│   ├── AppointmentsPage.jsx
│   ├── DashboardPage.jsx
│   ├── RegisterVisitorPage.jsx
│   ├── VerifyPassPage.jsx
│   └── VisitorsPage.jsx
├── services/api.js            # Shared API request and CSV export helpers
└── utils/formatters.js        # Shared date/status formatting helpers
```

When adding a new feature, keep reusable UI in `components/`, page-level composition in `pages/`, reusable React behavior in `hooks/`, API/network logic in `services/`, and pure helpers in `utils/`.

## Important API endpoints
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST /api/auth/staff` (admin only)
- `GET/POST /api/visitors`
- `POST /api/visitors/verify`
- `POST /api/visitors/:id/check-in`, `POST /api/visitors/:id/check-out`
- `POST /api/visitors/:id/revoke`
- `DELETE /api/visitors/:id` — delete pass after checkout (admin only)
- `GET /api/visitors/:id/pdf` — PDF visitor badge
- `GET/POST /api/appointments`, `POST /api/appointments/:id/decision`
- `GET /api/dashboard/stats`
- `GET /api/reports/logs`, `GET /api/reports/export.csv` (admin export)

## Roles
- **admin:** organization-wide visitor/staff administration and CSV export
- **security/frontdesk:** visitor operations and check-in/check-out
- **employee:** can create appointment requests and register visitors; can approve/reject appointment requests

Each account is assigned an `organizationId`; visitor, pass, appointment, and check-log queries are scoped to that organization. For a second tenant, create an `Organization` document and an admin with its `organizationId` (or run a separate seed configuration for that tenant). There is no public self-service organization signup flow in this MVP.

## Optional notifications
Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` for email. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM` for SMS. Email requires a visitor email; SMS requires a phone number in a format accepted by your Twilio account. Provider credentials and billing are external prerequisites. Without configuration, notifications are reported as not configured and are not sent.

## Implementation notes and limitations
- Visitor photos are represented by an optional `photoUrl`; a file-upload/storage pipeline is not included.
- The QR pass and PDF badge are generated server-side; the existing dashboard also renders a QR code for on-screen passes.
- Appointment approval creates a visitor record and pass, but email/SMS delivery is not separately sent from the appointment approval route.
- No public visitor self-service portal, password reset, multi-factor auth, organization signup UI, or automated deployment is included.
- For production use, add audit/retention policy, stronger validation, CSRF strategy if using cookies, request logging, integration tests, and secrets management.

## Testing status
The included Node test covers pass-ID generation. JavaScript syntax checks were run on the server source. A complete end-to-end run against a live MongoDB instance and an installed client dependency tree was not available in this build environment; therefore database flows, PDF rendering, SMTP/SMS delivery, and production deployment are **not claimed as end-to-end tested**.

## Account registration and sign out (updated)

- The sign-in screen now includes **New organization? Create an account**.
- Organization registration creates a new organization and its first administrator. Use a valid email and a password of at least 10 characters.
- The public registration endpoint is `POST /api/auth/register` and is rate-limited to 5 attempts per hour per IP.
- Existing users can return to the sign-in form with **Already registered? Sign in**.
- **Sign out** is now visible in the dashboard top bar, including on mobile widths. It clears the session token from `sessionStorage`.
- This self-service registration creates an organization administrator only. Staff accounts should be created by an authenticated administrator.

Updated in this revision: public organization registration UI/API and a clearly labeled sign-out action. The frontend production build could not be verified in this environment because dependency installation timed out; run `npm install` and `npm run build` locally before relying on it.


## Role-based access (RBAC)

Sign-in includes an assigned-role selector. The API checks the selected role against the role stored for the account; selecting a different role never grants extra access. An organization admin can open **Staff & roles** to create accounts for Admin, Security, Frontdesk, and Employee roles, and enable/disable staff accounts.

| Role | Main workspace access |
|---|---|
| Admin | Dashboard, visitor registration/directory, appointments, pass verification, staff management, CSV export |
| Security | Dashboard, visitor directory, pass verification, check-in/check-out |
| Frontdesk | Dashboard, visitor registration/directory, appointments, pass verification, check-in/check-out |
| Employee | Dashboard and appointment workflow |

Permissions are enforced by the API as well as the navigation. Staff accounts must be created by an organization admin; public organization registration creates only the first admin.
