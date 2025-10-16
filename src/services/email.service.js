import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  const letter = transporter.sendMail({
    to: email,
    subject: subject,
    html: html,
  });

  return letter;
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href='${href}'>${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate profile',
  });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href='${href}'>${href}</a>
  `;

  return send({
    email,
    subject: 'Password Reset Instructions',
    html,
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendPasswordResetEmail,
};
