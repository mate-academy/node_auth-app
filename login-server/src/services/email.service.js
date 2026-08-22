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
  const href = `${process.env.CLIENT_HOST}/activate?activationToken=${token}`;
  const html = `
  <h1>Activate account</h1>
   <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password-confirm?token=${token}`;
  const html = `
  <h1>Reset your password</h1>
  <p>Follow the link below to set a new password. The link is valid for 1 hour.</p>
   <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Password reset',
  });
}

function sendEmailChangedNotification(oldEmail, newEmail) {
  const html = `
  <h1>Your email has been changed</h1>
  <p>The email on your account was changed to <b>${newEmail}</b>.</p>
  <p>If you did not make this change, please contact support immediately.</p>`;

  return send({
    email: oldEmail,
    html,
    subject: 'Your account email was changed',
  });
}

export const emailService = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangedNotification,
};
