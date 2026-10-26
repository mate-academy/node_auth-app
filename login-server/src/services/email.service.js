import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${encodeURIComponent(token)}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}" >${href}</a>
    `;

  return send({
    email,
    html,
    subject: 'Active',
  });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${encodeURIComponent(token)}`;

  const html = `
    <h1>Reset your password</h1>
    <p>To reset your password, follow this link:</p>
    <a href="${href}">${href}</a>
    <p>If you did not request a password reset, ignore this email.</p>`;

  return send({
    email,
    html,
    subject: 'Password reset',
  });
}

export const emailService = {
  sendActivationEmail,
  sendPasswordResetEmail,
  send,
};
