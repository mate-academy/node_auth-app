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

const send = async ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">CLICK</a>
  `;

  return send({ email, subject: 'Activate', html });
};

const sendResetPassword = (email, resetToken) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${resetToken}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">CLICK</a>
  `;

  return send({ email, subject: 'Activate', html });
};

export const emailService = {
  sendActivationEmail,
  send,
  sendResetPassword,
};
