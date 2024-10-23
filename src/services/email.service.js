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
    subject: 'Acivate',
  });
}

function sendResetPasswordEmail(email, resetToken) {
  const href = `${process.env.CLIENT_HOST}/auth/resetPassword/${resetToken}`;
  const html = `
    <h1>Password reset</h1>
    <p>Want to reset your password? Follow the link: </p>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Password reset',
  });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendResetPasswordEmail,
};
