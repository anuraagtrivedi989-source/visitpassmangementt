// import test from 'node:test';
// import assert from 'node:assert/strict';
// import { allowRoles } from '../src/middleware/auth.js';

// function invokeGuard(roles, role) {
//   let nextCalled = false;
//   let statusCode = 200;
//   let responseBody;
//   const req = { admin: role ? { role } : undefined };
//   const res = {
//     status(code) { statusCode = code; return this; },
//     json(body) { responseBody = body; return this; },
//   };
//   allowRoles(...roles)(req, res, () => { nextCalled = true; });
//   return { nextCalled, statusCode, responseBody };
// }

// test('admin-only guard permits admin', () => {
//   assert.equal(invokeGuard(['admin'], 'admin').nextCalled, true);
// });

// test('admin-only guard rejects security with 403', () => {
//   const result = invokeGuard(['admin'], 'security');
//   assert.equal(result.nextCalled, false);
//   assert.equal(result.statusCode, 403);
//   assert.equal(result.responseBody.message, 'Insufficient role permissions.');
// });

// test('guard rejects missing role with 403', () => {
//   const result = invokeGuard(['admin', 'frontdesk'], undefined);
//   assert.equal(result.nextCalled, false);
//   assert.equal(result.statusCode, 403);
// });

// test('multi-role guard permits each explicitly allowed role', () => {
//   for (const role of ['admin', 'security', 'frontdesk']) {
//     assert.equal(invokeGuard(['admin', 'security', 'frontdesk'], role).nextCalled, true);
//   }
//   assert.equal(invokeGuard(['admin', 'security', 'frontdesk'], 'employee').nextCalled, false);
// });
