import nodemailer from 'nodemailer';
import 'dotenv/config.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
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

export function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

export function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${email}/${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset Your Password' });
}

async function sendEmailChangedNotification(oldEmail, newEmail) {
  await transporter.sendMail({
    to: oldEmail,
    subject: 'Your email was changed',
    html: `
      <p>Your account email was changed.</p>
      <p><b>New email:</b> ${newEmail}</p>
      <p>If this was not you — contact support immediately.</p>
    `,
  });
}


export const emailService = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
  send,
};
