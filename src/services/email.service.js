import nodemailer from 'nodemailer';
import 'dotenv/config';

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
    to: email, // list of receivers
    subject, // Subject line
    html, // html body
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  // eslint-disable-next-line no-console
  console.log('Email is sent');

  return send({ email, html, subject: 'Activate' });
}

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Password reset</h1>
    <a href="${href}">${href}</a>
  `;

  // eslint-disable-next-line no-console
  console.log('Password reset email is sent');

  return send({ email, html, subject: 'Password Reset' });
}

function sendEmailChangeEmail(email, newEmail) {
  const html = `
    <h1>Change Email</h1>
    <p>Your email was changed to: ${newEmail}</p>
  `;

  // eslint-disable-next-line no-console
  console.log('Email-change email is sent');

  return send({ email, html, subject: 'Your email was changed' });
}

export const emailService = {
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChangeEmail,
  send,
};
