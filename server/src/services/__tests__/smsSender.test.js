// ---------------------------------------------------------
// smsSender.test.js – unit tests for the smsSender abstraction
// ---------------------------------------------------------


import { jest } from '@jest/globals';

// Mock Twilio before importing the service.
jest.unstable_mockModule('twilio', () => ({
  default: jest.fn(),
}));

const { default: twilio } = await import('twilio');
const { sendSms } = await import('../smsSender.js');

// smsSender.js uses Node's native global fetch.
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

describe('smsSender – TextBee provider', () => {
  const to = '+15550001111';
  const body = 'Test message';

  beforeEach(() => {
    process.env.SMS_PROVIDER = 'textbee';
    delete process.env.TEXTBEE_API_KEY;
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.SMS_PROVIDER;
    delete process.env.TEXTBEE_API_KEY;
  });

  it('sends a POST request and resolves on success', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true, id: 'abc123' }),
    });

    await expect(sendSms(to, body)).resolves.toBe('sent');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://textbee.com/api/v1/send',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: to, message: body }),
      })
    );
  });

  it('rejects when TextBee returns failure', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'Rate limit exceeded',
      }),
    });

    await expect(sendSms(to, body)).rejects.toMatchObject({
      message: 'Rate limit exceeded',
      provider: 'textbee',
    });
  });

  it('includes API key when configured', async () => {
    process.env.TEXTBEE_API_KEY = 'FAKE_KEY';

    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    await sendSms(to, body);

    const calledPayload = JSON.parse(fetchMock.mock.calls[0][1].body);

    expect(calledPayload).toMatchObject({ key: 'FAKE_KEY' });
  });
});

describe('smsSender – Twilio fallback', () => {
  const to = '+15550002222';
  const body = 'Twilio test';

  beforeEach(() => {
    process.env.SMS_PROVIDER = 'twilio';
    process.env.TWILIO_ACCOUNT_SID = 'SID';
    process.env.TWILIO_AUTH_TOKEN = 'TOKEN';
    process.env.TWILIO_FROM = '+15551112222';

    twilio.mockReturnValue({
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'SM123' }),
      },
    });
  });

  afterEach(() => {
    delete process.env.SMS_PROVIDER;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM;
  });

  it('calls Twilio client when provider is twilio', async () => {
    await expect(sendSms(to, body)).resolves.toBe('sent');

    const mockClient = twilio.mock.results[0].value;

    expect(mockClient.messages.create).toHaveBeenCalledWith({
      from: process.env.TWILIO_FROM,
      to,
      body,
    });
  });
});

describe('smsSender – no provider', () => {
  beforeEach(() => {
    delete process.env.SMS_PROVIDER;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_FROM;
  });

  it('throws when neither provider is configured', async () => {
    await expect(
      sendSms('+15551112233', 'msg')
    ).rejects.toMatchObject({
      message: 'No SMS provider configured',
      provider: 'none',
    });
  });
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});
