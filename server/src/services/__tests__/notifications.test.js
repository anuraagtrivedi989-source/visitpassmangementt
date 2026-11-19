// ---------------------------------------------------------
// notifications.test.js – integration test for sendVisitorNotification
// ---------------------------------------------------------

// 

import { jest } from '@jest/globals';

// Register ESM mocks before importing the service.
jest.unstable_mockModule('../smsSender.js', () => ({
  sendSms: jest.fn(),
}));

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(),
  },
}));

jest.unstable_mockModule('twilio', () => ({
  default: jest.fn(),
}));

// Import mocked modules after registering mocks.
const { sendSms } = await import('../smsSender.js');
const nodemailer = (await import('nodemailer')).default;
const { sendVisitorNotification } = await import('../notifications.js');

describe('sendVisitorNotification – SMS flow integration', () => {
  const visitor = {
    passId: 'PASS123',
    fullName: 'John Doe',
    phone: '+15550009999',
    hostName: 'Alice',
    purpose: 'Meeting',
    visitDate: new Date('2024-01-01'),
    organization: 'Acme Corp',
    status: 'scheduled',
  };

  const email = 'john@example.com';
  const sendMailMock = jest.fn();

  beforeEach(() => {
    sendSms.mockResolvedValue('sent');

    sendMailMock.mockResolvedValue({ messageId: 'msg-1' });

    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock,
    });

    process.env.SMTP_HOST = 'smtp.test';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'pass';
    process.env.SMTP_FROM = 'noreply@test.com';
    process.env.SMTP_PORT = '587';
  });

  afterEach(() => {
    jest.clearAllMocks();

    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_FROM;
    delete process.env.SMTP_PORT;
  });

  it('calls SMS sender and returns sms sent', async () => {
    const result = await sendVisitorNotification({
      email,
      phone: visitor.phone,
      visitor,
    });

    expect(sendSms).toHaveBeenCalledWith(
      visitor.phone,
      expect.any(String)
    );

    expect(result.sms).toBe('sent');
    expect(result.email).toBe('sent');
  });

  it('records SMS failed when SMS sender throws', async () => {
    sendSms.mockRejectedValue(new Error('Rate limit exceeded'));

    const result = await sendVisitorNotification({
      email,
      phone: visitor.phone,
      visitor,
    });

    expect(result.sms).toBe('failed');
    expect(result.smsError).toBe('Rate limit exceeded');
    expect(result.email).toBe('sent');
  });

  it('does not attempt SMS when phone is undefined', async () => {
    const result = await sendVisitorNotification({
      email,
      phone: undefined,
      visitor,
    });

    expect(sendSms).not.toHaveBeenCalled();
    expect(result.sms).toBe('not-configured');
    expect(result.email).toBe('sent');
  });
});
