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

function sendConfirmEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/change-email/${token}`;

  const html = `
  <h1>Confirm changing Email</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Changing Email address',
  });
}

function sendEmailChanged(oldEmail, newEmail) {
  const html = `
  <h1>Your email has been succesfull changed!</h1>
  <h2>Email changed from ${oldEmail} to ${newEmail}</h2>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Email been changed',
  });
}

function sendResetPassword(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
  <h1>Confirm password changing</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Password changing',
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendConfirmEmail,
  sendEmailChanged,
  sendResetPassword,
};
