import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for other ports
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

function sendActivation(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;

  const html = `
    <h1>Activation account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendReset(email, token) {
  const href = `${process.env.CLIENT_HOST}/resetPassword/${email}/${token}`;

  const html = `
    <h1>Reset password account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'RESET' });
}

function sendConfirmation(email, token) {
  const href = `${process.env.CLIENT_HOST}/confirmation/${email}/${token}`;

  const html = `
    <h1>Confirmation email account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'CONFIRMATION' });
}

export const emailService = {
  sendActivation,
  send,
  sendReset,
  sendConfirmation,
};
