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

function sendActivationMail(email, token) {
  const link = `http://localhost:${process.env.PORT}/activate/${token}`;

  return sendMail({
    to: email,
    subject: 'Activation account',
    html: `
        <p>Follow the link below to activate your account </p>
        <a href=${link}>${link}</a>
        `,
  });
}

exports.sendActivationMail = sendActivationMail;
