import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const defaultFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: defaultFrom,
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
  const html = `<p>Your email has been changed to ${newEmail}</p>`;

  return send({
    email: oldEmail,
    html,
    subject: 'Email Change Notification',
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetEmail,
  sendUpdateEmail,
};
