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
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate your account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate account',
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `<h1>Reset password</h1><a href="${href}">${href}</a>`;

  return send({ email, html, subject: 'Reset password' });
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  return send({
    email: oldEmail,
    subject: 'Email changed',
    html: `<h1>Your email was changed to ${newEmail}</h1>`,
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetEmail,
  send,
  sendEmailChangeNotification,
};
