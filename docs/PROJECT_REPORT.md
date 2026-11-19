# VisitPass — Visitor Pass Management System
## College Project Report Template

**Student name:** [Enter name]  
**Roll number:** [Enter roll number]  
**Course/branch:** B.Tech CSE  
**College:** [Enter college name]  
**Academic session:** [Enter session]

## 1. Abstract
VisitPass is a web-based visitor pass management system designed to digitize visitor registration and entry/exit tracking in offices and institutions. An authenticated administrator can register visitors, issue a unique pass ID with a QR code, verify passes, and record check-in/check-out times. The system uses React for the user interface, Node.js and Express for the API, and MongoDB for persistent storage.

## 2. Problem Statement
Manual visitor registers can be difficult to search, may contain incomplete records, and do not provide a convenient digital verification process. VisitPass provides a central digital workflow for recording and checking visitor passes.

## 3. Objectives
- Digitize visitor registration.
- Generate a unique ID and QR code for each pass.
- Verify a pass against database records.
- Record visitor check-in and check-out.
- Search visitor records and display visit statistics.
- Demonstrate full-stack web development concepts.

## 4. Proposed System
An administrator logs in, registers visitor details, and receives a digital pass. The QR code contains the unique pass ID. During verification, the server looks up the pass in MongoDB and checks its status and scheduled date. The administrator can then check the visitor in and later check them out.

## 5. Technology Stack
- React and Vite: frontend UI
- CSS: responsive styling
- Node.js and Express.js: REST API
- MongoDB and Mongoose: database and schema validation
- bcryptjs: password hashing
- JSON Web Token (JWT): authenticated API sessions
- qrcode: QR image generation in the frontend
- html5-qrcode: browser-based QR scanning

## 6. Main Modules
1. **Admin authentication:** login endpoint, hashed password comparison, signed JWT.
2. **Visitor registration:** form validation and visitor record creation.
3. **Digital pass:** unique pass ID and QR code.
4. **Pass verification:** lookup by pass ID and check scheduled date/status.
5. **Entry/exit tracking:** status transitions from scheduled to checked-in to checked-out.
6. **Dashboard and search:** visitor totals, status counts, and text search.

## 7. Database Design
### Admin
- name: String
- email: String, unique
- passwordHash: String, hidden by default
- createdAt / updatedAt: timestamps

### Visitor
- passId: String, unique
- fullName: String
- phone: String
- organization: String
- purpose: String
- hostName: String
- visitDate: Date
- status: scheduled / checked-in / checked-out / expired
- checkedInAt / checkedOutAt: Date or null
- createdBy: reference to Admin
- createdAt / updatedAt: timestamps

## 8. System Requirements
**Software:** Node.js 20+, npm, MongoDB local or MongoDB Atlas, modern browser, VS Code (recommended).  
**Hardware:** A standard laptop/desktop capable of running Node.js and a browser.

## 9. Setup and Execution
Follow the steps in the project's root README.md. Configure the server `.env`, install dependencies, seed the admin, start the API, then install and run the client. Keep `.env` files private and never commit real secrets.

## 10. Testing Checklist
Record the actual outcome for each test before submission.

| Test case | Expected result | Actual result |
|---|---|---|
| Login with correct credentials | Dashboard opens | [Fill after testing] |
| Login with wrong credentials | Error shown | [Fill after testing] |
| Register valid visitor | Unique pass and QR shown | [Fill after testing] |
| Register with required field missing | Validation error | [Fill after testing] |
| Search visitor by name/pass ID | Matching record appears | [Fill after testing] |
| Verify existing pass | Status and visitor details returned | [Fill after testing] |
| Check in scheduled visitor on visit date | Status becomes checked-in | [Fill after testing] |
| Check out checked-in visitor | Status becomes checked-out | [Fill after testing] |
| Access protected API without token | 401 response | [Fill after testing] |

## 11. Limitations
- Admin account is provisioned through a seed script; there is no public admin registration.
- Passes are displayed in the application; email/SMS delivery is not implemented.
- QR scanning requires browser camera permission and a supported browser context.
- This is a college-project MVP and has not been security-audited for production use.

## 12. Future Scope
- Multiple roles (security desk, host, administrator).
- Email/SMS invitations and notifications.
- Visitor photo capture and ID-document verification.
- Expiry automation, audit logs, export to CSV/PDF.
- Deployment with HTTPS, monitoring, backups, and stronger production controls.

## 13. Conclusion
VisitPass demonstrates a full-stack digital visitor workflow using React, Express, Node.js, and MongoDB. It reduces reliance on paper-based records and provides a searchable visitor history with QR-based pass identification.

**Important:** Replace placeholders and report only the features that you have personally run and verified. Add your own screenshots and actual test results.
