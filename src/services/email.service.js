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
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sentResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
  <h1>Click the link below for create new password</h1>
  <a href="${href}">${href}</a>
`;

  return send({
    email,
    html,
    subject: 'Reset password',
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sentResetPasswordEmail,
};
