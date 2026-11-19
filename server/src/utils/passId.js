import crypto from 'node:crypto';

export function createPassId() {
  return `VP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
