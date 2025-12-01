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
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    <h1>Activate your account</h1>
    <p>Click the link to activate your account:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Account Activation',
  });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Reset password</h1>
    <p>Click below to reset the password (valid for 10 minutes):</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset Password',
  });
}

function sendChangeEmailConfirmation(newEmail, token) {
  const href = `${process.env.CLIENT_HOST}/activate-email/${token}`;

  const html = `
    <h1>Confirm email change</h1>
    <p>Click below to confirm your new email address:</p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email: newEmail,
    html,
    subject: 'Confirm Email Change',
  });
}

function sendEmailNotification(oldEmail, newEmail) {
  const html = `
    <h1>Your email was changed</h1>
    <p>New email: ${newEmail}</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Email Change Notification',
  });
}

export const emailService = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendChangeEmailConfirmation,
  sendEmailNotification,
  send,
};
