import 'dotenv/config';

import nodemailer from 'nodemailer';

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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'activate',
    html,
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset password',
    html,
  });
}

function sendSecurityEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;
  const html = `
  <h1>Security Alert: Your email has been changed.</h1>
  <p>Hello! Your email address on [Name] has been successfully changed. Wasn't that you? If you didn't change your address, your account may have been hacked. Please follow this link immediately to undo the changes and protect your profile: <a href="${href}">${href}</a></p>
  `;

  return send({
    email,
    subject: 'Security Alert: Your email has been changed.',
    html,
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetEmail,
  sendSecurityEmail,
};
