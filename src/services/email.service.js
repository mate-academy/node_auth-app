import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
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

export function sendActivationLink(name, email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <p>Dear ${name}, it's message for activation your account!</p>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendResetLink(name, email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return send({
    email,
    subject: 'Password resseting',
    html: `
      <h1>Password resseting</h1>
      <p>Dear ${name}, it's message for resetting of your password!</p>
      <a href="${link}">${link}</a>
    `,
  });
}

export const emailService = { send, sendActivationLink, sendResetLink };
