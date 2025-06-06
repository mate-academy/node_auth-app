import 'dotenv/config';
import nodemailer from 'nodemailer';

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
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
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

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${token}`;
  const html = `
    <h1>Password reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Password Reset',
  });
}

function sendUpdateEmail(oldEmail, newEmail) {
  const email = oldEmail;
  const html = `<p>Your email has been changed to ${newEmail}</p>`;

  return send({
    email,
    html,
    subject: 'Email Change Notification',
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetEmail,
  sendUpdateEmail,
  send,
};
