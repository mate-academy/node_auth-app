'use strict';

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: `"Auth API" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: text || '',
    html,
  });
}

function sendActivationMail(email, activationToken) {
  const link = `${process.env.CLIENT_URL}/activate/${activationToken}`;

  return sendMail({
    to: email,
    subject: 'Activation account',
    html: `
        <p>Follow the link below to activate your account </p>
        <a href=${link}>${link}</a>
        `,
  });
}

function sendResetMail(email, resetToken) {
  const link = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  return sendMail({
    to: email,
    subject: 'Reset password',
    html: `
    <p>Follow the link below to reset your password </p>
    <a href=${link}>${link}</a>
    `,
  });
}

function sendChangeMail(email) {
  return sendMail({
    to: email,
    subject: 'Email removed',
    html: `
      <h1>This email was removed from app</h1>
    `,
  });
}

exports.mailService = {
  sendActivationMail,
  sendResetMail,
  sendChangeMail,
};
