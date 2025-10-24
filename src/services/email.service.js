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
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`;

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

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Reset account password</h1>
    <p>Click the link below to reset your password (valid for 10 minutes):</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset Password',
  });
}

function sendChangeEmailNotification(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate-email/${email}/${token}`;

  const html = `
    <h1>Change email address</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Email change',
  });
}

function sendEmailNotification(email, newEmail) {
  const html = `
    <h1>Your email address was changed</h1>
    <p>New email ${newEmail}</p>
  `;

  return send({
    email,
    html,
    subject: 'Email change',
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangeEmailNotification,
  sendEmailNotification,
  send,
};
