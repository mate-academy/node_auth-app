import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
    <h1>Activate your email</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Reset your password</h1>
    <p>The link is valid for 1 hour. If this wasn't you, ignore this email.</p>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset password' });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendPasswordResetEmail,
};
