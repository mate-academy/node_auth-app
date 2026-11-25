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

export function send(email, subject, html) {
  return transporter.sendMail({
    to: email,
    subject: subject,
    html: html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
        <h1>Activate your account</h1>
        <a href="${href}">${href}</a>
        `;

  return send(email, 'Activate your account', html);
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;

  const html = `
        <h1>Reset password</h1>
        <a href="${href}">${href}</a>
        `;

  return send(email, 'Confirm password reset', html);
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetEmail,
};
