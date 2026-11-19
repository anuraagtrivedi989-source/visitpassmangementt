// ---------------------------------------------------------
// smsSender.js – tiny abstraction that chooses the SMS provider
// ---------------------------------------------------------
// This file lets the rest of the code stay unchanged while we can
// switch between Twilio (existing) and TextBee (free tier) at runtime.

// import fetch from 'node-fetch'; // Removed – using native global fetch
          // Node ≥18 already has global fetch,
                                         // but importing makes the Jest mock easier.
import twilio from 'twilio';

/**
 * Sends an SMS using the provider configured via `SMS_PROVIDER`.
 *
 * @param {string} to   – E.164 formatted phone number (e.g. +15551234567)
 * @param {string} body – Plain‑text message (≤160 chars for TextBee free tier)
 * @returns {Promise<'sent'>} – resolves when the provider confirms delivery
 * @throws  {Error}           – with `error.provider` set to the failing provider
 */
export async function sendSms(to, body) {
  const provider = (process.env.SMS_PROVIDER || 'twilio').toLowerCase();

  // ---------------------------------------------------------
  // TextBee – free HTTP API
  // ---------------------------------------------------------
  if (provider === 'textbee') {
    // TextBee public endpoint (no key) or paid endpoint (key added)
    const endpoint = 'https://textbee.com/api/v1/send';
    const payload = {
      phone: to,
      message: body,
      ...(process.env.TEXTBEE_API_KEY && { key: process.env.TEXTBEE_API_KEY }),
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();

    if (!json.success) {
      const err = new Error(json.error || 'TextBee failed');
      err.provider = 'textbee';
      err.details = json;
      throw err;
    }

    return 'sent';
  }

  // ---------------------------------------------------------
  // Twilio – keep existing behaviour as a fallback / alternative
  // ---------------------------------------------------------
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    await client.messages.create({
      from: process.env.TWILIO_FROM,
      to,
      body,
    });
    return 'sent';
  }

  // ---------------------------------------------------------
  // No provider configured
  // ---------------------------------------------------------
  const err = new Error('No SMS provider configured');
  err.provider = 'none';
  throw err;
}

