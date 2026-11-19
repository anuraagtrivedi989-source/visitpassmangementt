import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { sendSms } from './smsSender.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

export async function generatePassPdfBuffer(visitor, organizationName = 'VisitPass') {
  const qrPayload = JSON.stringify({
    passId: visitor.passId,
    organizationId: String(visitor.organizationId || ''),
  });
  const qrDataUrl = await QRCode.toDataURL(qrPayload);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A6', margin: 28 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(18).fillColor('#123b35').text(organizationName.toUpperCase(), { align: 'center' });
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor('#555').text('DIGITAL VISITOR PASS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).fillColor('#111').text(visitor.fullName, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Pass ID: ${visitor.passId}`);
      if (visitor.organization) doc.text(`Organization: ${visitor.organization}`);
      if (visitor.phone) doc.text(`Phone: ${visitor.phone}`);
      doc.text(`Host: ${visitor.hostName}`);
      doc.text(`Purpose: ${visitor.purpose}`);
      doc.text(`Visit date: ${new Date(visitor.visitDate).toLocaleDateString()}`);
      doc.text(`Status: ${visitor.status || 'scheduled'}`);
      doc.moveDown();
      doc.image(qrDataUrl, { fit: [120, 120], align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor('#666').text('Present this QR code at the security desk.', { align: 'center' });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Sends visitor notifications via SMTP Email and Twilio SMS.
export async function sendVisitorNotification({ email, phone, visitor, organizationName = 'VisitPass' }) {
  const results = { email: 'not-configured', sms: 'not-configured' };
  const formattedDate = new Date(visitor.visitDate).toLocaleDateString();

  const textMessage = `${organizationName} — Digital Visitor Pass

Hello ${visitor.fullName},

Your visitor pass has been successfully issued.

Pass Details:
• Pass ID: ${visitor.passId}
• Visitor Name: ${visitor.fullName}
• Phone: ${visitor.phone || 'N/A'}
${visitor.organization ? `• Company / Organization: ${visitor.organization}\n` : ''}• Host: ${visitor.hostName}
• Purpose of Visit: ${visitor.purpose}
• Scheduled Visit Date: ${formattedDate}
• Status: ${visitor.status || 'scheduled'}

Please present the attached QR code image or PDF pass at the security desk upon arrival.`;

  const htmlMessage = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: #123b35; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; }
    .header p { margin: 6px 0 0; font-size: 12px; opacity: 0.85; text-transform: uppercase; }
    .content { padding: 24px; }
    .pass-id { background: #f1f5f9; border-radius: 6px; padding: 10px; text-align: center; font-family: monospace; font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 20px; letter-spacing: 1px; }
    .field { margin-bottom: 12px; font-size: 14px; }
    .label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
    .val { color: #0f172a; font-size: 15px; font-weight: 500; }
    .qr-container { text-align: center; margin: 24px 0 16px; padding: 16px; background: #fafafa; border-radius: 8px; border: 1px dashed #cbd5e1; }
    .qr-container img { width: 140px; height: 140px; }
    .footer { font-size: 12px; color: #64748b; text-align: center; padding: 16px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${organizationName}</h1>
      <p>Digital Visitor Pass</p>
    </div>
    <div class="content">
      <div class="pass-id">${visitor.passId}</div>
      <div class="field"><div class="label">Visitor Name</div><div class="val">${visitor.fullName}</div></div>
      <div class="field"><div class="label">Phone</div><div class="val">${visitor.phone || 'N/A'}</div></div>
      ${visitor.organization ? `<div class="field"><div class="label">Company / Organization</div><div class="val">${visitor.organization}</div></div>` : ''}
      <div class="field"><div class="label">Host</div><div class="val">${visitor.hostName}</div></div>
      <div class="field"><div class="label">Purpose of Visit</div><div class="val">${visitor.purpose}</div></div>
      <div class="field"><div class="label">Scheduled Visit Date</div><div class="val">${formattedDate}</div></div>
      <div class="qr-container">
        <img src="cid:qrcode" alt="QR Pass" />
        <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">Present this QR code or the attached PDF pass at the security desk</p>
      </div>
    </div>
    <div class="footer">
      Please present this pass upon arrival. Safe travels!
    </div>
  </div>
</body>
</html>`;

  if (email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      const qrPayload = JSON.stringify({
        passId: visitor.passId,
        organizationId: String(visitor.organizationId || ''),
      });

      const [qrBuffer, pdfBuffer] = await Promise.all([
        QRCode.toBuffer(qrPayload, { width: 300, margin: 2 }),
        generatePassPdfBuffer(visitor, organizationName),
      ]);

      const attachments = [
        {
          filename: `qr-${visitor.passId}.png`,
          content: qrBuffer,
          cid: 'qrcode',
          contentType: 'image/png',
        },
        {
          filename: `${visitor.passId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Your visitor pass: ${visitor.passId}`,
        text: textMessage,
        html: htmlMessage,
        attachments,
      });
      results.email = 'sent';
    } catch (error) {
      results.email = 'failed';
      results.emailError = error.message;
    }
  }

  // SMS sending – now delegated to smsSender which selects the provider
  if (phone) {
    try {
      // TextBee’s free tier only allows 160 chars; truncate if needed.
      const rawMessage = `${organizationName}: Pass ${visitor.passId} issued for ${visitor.fullName}. Host: ${visitor.hostName}. Purpose: ${visitor.purpose}. Date: ${formattedDate}.`;
      const smsMessage = rawMessage.length > 160 ? rawMessage.slice(0, 157) + '...' : rawMessage;
      await sendSms(phone, smsMessage);
      results.sms = 'sent';
    } catch (error) {
      results.sms = 'failed';
      results.smsError = error.message;
    }
  }

  return results;
}
