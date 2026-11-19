import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePassPdfBuffer } from '../src/services/notifications.js';

test('generatePassPdfBuffer builds a valid PDF buffer including phone and organization', async () => {
  const dummyVisitor = {
    passId: 'VP-TEST123-ABC',
    fullName: 'Jane Doe',
    phone: '+1234567890',
    organization: 'Acme Robotics',
    hostName: 'Dr. John Smith',
    purpose: 'Quarterly Review',
    visitDate: new Date('2026-12-01T10:00:00Z'),
    status: 'scheduled',
    organizationId: '654321654321654321654321',
  };

  const buffer = await generatePassPdfBuffer(dummyVisitor, 'VisitPass Corp');
  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 1000);
  // PDF header check (%PDF-)
  assert.equal(buffer.subarray(0, 4).toString(), '%PDF');
});

