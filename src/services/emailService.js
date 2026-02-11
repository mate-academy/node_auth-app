import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  debug: true,
  logger: true,
});

export function send({ email, subject, html }) {
  // const link = `https://yourdomain.com/activate/${token}`;

  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

export function sendActivationEmail(email, activationToken) {
  const href = `http://localhost:5173/activation/${activationToken}`;
  const html = `<a href="${href}">Click this link to activate your account </a>`;

  return send({ email, html, subject: 'Activate' });
}

export function sendResetPasswordEmail(email, resetToken) {
  const href = `http://localhost:5173/reset-password/${resetToken}`;
  const html = `<a href="${href}">Click this link to reset your password </a>`;

  return send({ email, html, subject: 'Reset password' });
}

export function sendEmailChanged(email, newEmail) {
  // const href = `http://localhost:5173/activation/${activationToken}`;
  const html = `<p>Your email for registration on site 'Birds' has been changed to ${newEmail} </p>`;

  return send({ email, html, subject: 'Change of email' });
}

// console.log('Email is sent');

export const emailService = {
  sendActivationEmail,
  sendEmailChanged,
  sendResetPasswordEmail,
  send,
};
