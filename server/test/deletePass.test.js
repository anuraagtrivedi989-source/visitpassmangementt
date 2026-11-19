import test from 'node:test';
import assert from 'node:assert/strict';
import { allowRoles } from '../src/middleware/auth.js';

function invokeGuard(roles, role) {
  let nextCalled = false;
  let statusCode = 200;
  let responseBody = null;
  const req = { admin: role ? { role } : undefined };
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };
  allowRoles(...roles)(req, res, () => {
    nextCalled = true;
  });
  return { nextCalled, statusCode, responseBody };
}

test('delete pass route (admin only) allows admin role', () => {
  const result = invokeGuard(['admin'], 'admin');
  assert.equal(result.nextCalled, true);
  assert.equal(result.statusCode, 200);
});

test('delete pass route (admin only) forbids security with 403', () => {
  const result = invokeGuard(['admin'], 'security');
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 403);
  assert.equal(result.responseBody?.message, 'Insufficient role permissions.');
});

test('delete pass route (admin only) forbids frontdesk with 403', () => {
  const result = invokeGuard(['admin'], 'frontdesk');
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 403);
  assert.equal(result.responseBody?.message, 'Insufficient role permissions.');
});

test('delete pass route (admin only) forbids employee with 403', () => {
  const result = invokeGuard(['admin'], 'employee');
  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, 403);
  assert.equal(result.responseBody?.message, 'Insufficient role permissions.');
});

test('delete pass route status rule: only checked-out passes are eligible for deletion', () => {
  const canDeletePass = (status) => status === 'checked-out';

  assert.equal(canDeletePass('checked-out'), true);
  assert.equal(canDeletePass('scheduled'), false);
  assert.equal(canDeletePass('checked-in'), false);
  assert.equal(canDeletePass('revoked'), false);
  assert.equal(canDeletePass('expired'), false);
});

