# VisitPass Viva — Quick Questions and Answers

**1. What is the project?**  
A web-based visitor pass system for registering visitors, generating unique passes, verifying them, and recording entry and exit.

**2. Why did you choose MERN?**  
It supports full-stack JavaScript development. React builds the UI, Express and Node handle API logic, and MongoDB stores records.

**3. What is React used for?**  
Building reusable UI components and handling client-side state.

**4. What is Express.js?**  
A Node.js web framework used to define HTTP routes and middleware.

**5. What is REST API?**  
An HTTP interface through which the frontend communicates with backend resources using methods such as GET and POST.

**6. What is MongoDB?**  
A document-oriented NoSQL database that stores records as BSON documents.

**7. What is Mongoose?**  
An ODM library for defining schemas, validation, and database operations with MongoDB.

**8. Why hash passwords?**  
So the database stores a password hash rather than the original password. This project uses bcryptjs.

**9. What is JWT?**  
A signed token used to represent an authenticated session. Protected API routes verify the token.

**10. What does the QR code contain?**  
A unique pass ID. The server uses that ID to look up the visitor record; the QR code is not itself proof that a pass is valid.

**11. Explain check-in and check-out.**  
Check-in changes a scheduled pass to checked-in and records the time. Check-out changes a checked-in pass to checked-out and records the exit time.

**12. What are CRUD operations?**  
Create, Read, Update, and Delete. The current MVP implements creation and reading/searching plus specific status updates; a general visitor delete/edit interface is not included.

**13. What are the current limitations?**  
No email/SMS delivery, no public admin registration, and it is not production security-audited.

**14. What could be added in the future?**  
Host approvals, email notifications, visitor photo capture, CSV/PDF reports, role-based access, and audit logs.

**15. What did you test?**  
Answer based on your actual local test results. Use the checklist in PROJECT_REPORT.md and do not claim unrun tests.
