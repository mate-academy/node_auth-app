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
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate your account' });
}

function sendResetPasswordEmail(email, resetPasswordToken) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetPasswordToken}`;
  const html = `
  <h1>Confirm password change</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset your password' });
}

function sendChangeEmailLink(email, resetEmailToken) {
  const href = `${process.env.CLIENT_HOST}/profile/change-email/${resetEmailToken}`;
  const html = `
    <h1>Confirm email change</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Confirm your new email' });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangeEmailLink,
};
