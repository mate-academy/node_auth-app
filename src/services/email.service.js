'use strict';

const nodemailer = require('nodemailer');
const { FRONTEND_URL } = require('../config/env');

let transporter = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();

  /* eslint-disable no-console */
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       Ethereal Test Email Account        ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  User: ${testAccount.user.padEnd(34)}║`);
  console.log(`║  Pass: ${testAccount.pass.padEnd(34)}║`);
  console.log('║  View: https://ethereal.email/messages   ║');
  console.log('╚══════════════════════════════════════════╝\n');
  /* eslint-enable no-console */

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  return transporter;
}

async function sendMail({ to, subject, html }) {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: '"Auth App" <noreply@authapp.dev>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  /* eslint-disable-next-line no-console */
  console.log(`📧  ${subject} → ${to}  |  ${previewUrl}`);

  return previewUrl;
}

// ── Templates ────────────────────────────────────────────────────────────────

function wrap(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body{font-family:Georgia,serif;background:#080b12;color:#e8e4db;padding:40px 20px;margin:0}
    .c{max-width:540px;margin:0 auto;background:#0d1321;border:1px solid #1e2a3a;padding:44px}
    h1{font-size:26px;margin:0 0 20px;color:#f0a429}
    p{font-size:15px;line-height:1.7;color:#8a96a8;margin:0 0 14px}
    a.btn{display:inline-block;background:#f0a429;color:#080b12;padding:12px 28px;
          text-decoration:none;font-family:sans-serif;font-weight:700;font-size:13px;
          letter-spacing:.5px;margin:20px 0}
    code{font-family:monospace;font-size:13px;color:#f0a429;word-break:break-all}
    .foot{margin-top:36px;padding-top:20px;border-top:1px solid #1e2a3a;
          font-size:11px;color:#3e4a5a;font-family:sans-serif}
  </style></head><body><div class="c">${content}</div></body></html>`;
}

async function sendActivationEmail(email, name, token) {
  const url = `${FRONTEND_URL}/activate/${token}`;

  return sendMail({
    to: email,
    subject: 'Activate your account',
    html: wrap(`
      <h1>Welcome, ${name}.</h1>
      <p>Please confirm your email address to activate your account.</p>
      <a href="${url}" class="btn">ACTIVATE ACCOUNT</a>
      <p>Or paste this link into your browser:<br><code>${url}</code></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <div class="foot">If you didn't create this account, you can safely ignore this email.</div>
    `),
  });
}

async function sendPasswordResetEmail(email, token) {
  const url = `${FRONTEND_URL}/reset-password/${token}`;

  return sendMail({
    to: email,
    subject: 'Reset your password',
    html: wrap(`
      <h1>Password Reset</h1>
      <p>We received a request to reset the password for your account.</p>
      <a href="${url}" class="btn">RESET PASSWORD</a>
      <p>Or paste this link into your browser:<br><code>${url}</code></p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, no action is needed.</p>
      <div class="foot">For security, this link can only be used once.</div>
    `),
  });
}

async function sendEmailChangeNotification(oldEmail, newEmail) {
  return sendMail({
    to: oldEmail,
    subject: 'Your email address was changed',
    html: wrap(`
      <h1>Email Changed</h1>
      <p>The email address on your account was changed to:</p>
      <p><code>${newEmail}</code></p>
      <p>If you made this change, no action is needed.</p>
      <p>If you did <strong>not</strong> make this change, please contact support immediately.</p>
      <div class="foot">This is an automated security notification.</div>
    `),
  });
}

async function sendEmailChangeConfirmation(newEmail, token) {
  const url = `${FRONTEND_URL}/confirm-email/${token}`;

  return sendMail({
    to: newEmail,
    subject: 'Confirm your new email address',
    html: wrap(`
      <h1>Confirm Email Change</h1>
      <p>Please confirm that you want to use this address for your account.</p>
      <a href="${url}" class="btn">CONFIRM NEW EMAIL</a>
      <p>Or paste this link into your browser:<br><code>${url}</code></p>
      <p>This link expires in <strong>24 hours</strong>.</p>
      <div class="foot">If you didn't request this change, please contact support.</div>
    `),
  });
}

module.exports = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeNotification,
  sendEmailChangeConfirmation,
};
