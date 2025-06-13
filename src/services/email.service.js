require('dotenv').config();

const nodemailer = require('nodemailer');

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // upgrade later with STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

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

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  const html = `
    <h1>Password reset</h1>
    <p>Click on the link below to reset your password:</p>
    <a href="${href}">${href}</a>
    <p>This link will be valid for 1 hour.</p>
  `;

  return send({
    email,
    html,
    subject: 'Password reset',
  });
}

const emailService = {
  send,
  sendActivationEmail,
  sendPasswordResetEmail,
};

module.exports = { emailService };
