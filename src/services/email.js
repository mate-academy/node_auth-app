// src/services/email.js
const nodemailer = require('nodemailer');

const NO_EMAIL = process.env.NO_EMAIL === '1';

let transporter = null;
if (!NO_EMAIL) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

async function send(to, subject, text) {
  if (NO_EMAIL) {
    console.log('[EMAIL:DRY-RUN]', { to, subject, text });
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text, // plaintext
  });
}

exports.sendActivationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/activate?token=${token}`;
  const text = `Activate your account:\n\n${url}\n\nIf you didn't request this, ignore.`;
  await send(to, 'Activate your account', text);
};

exports.sendPasswordResetEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const text = `Reset your password:\n\n${url}\n\nIf you didn't request this, ignore.`;
  await send(to, 'Password reset', text);
};

exports.sendEmailChangeNotice = async (oldEmail, newEmail) => {
  const text = `We received a request to change your email to ${newEmail}. If this wasn't you, contact support.`;
  await send(oldEmail, 'Email change notice', text);
};
