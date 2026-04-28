/* eslint-disable no-console */
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

function sendEmail(email, subject, html) {
  return transporter.sendMail({
    to: email,
    subject: subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    Account activation,
    <a href="${href}">${href}</a>
  `;

  return sendEmail(email, 'Account activation', html);
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${token}`;
  const html = `
    <h1>Password Reset</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${href}">${href}</a>
  `;

  return sendEmail(email, 'Reset Your Password', html);
}

async function sendEmailChangedNotification(oldEmail, newEmail) {
  await transporter.sendMail({
    to: oldEmail,
    subject: 'Your email was changed',
    html: `
      <p>Your account email was changed.</p>
      <p><b>New email:</b> ${newEmail}</p>
      <p>If this was not you — contact support immediately.</p>
    `,
  });
}

export const emailServices = {
  sendActivationEmail,
  sendEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
};
