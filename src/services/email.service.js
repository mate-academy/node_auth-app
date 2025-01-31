require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail({ name, email, activationToken }) {
  const href = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  const html = `
  <h1>Activate your account, ${name}</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, subject: 'Activate your account', html });
}

module.exports = {
  emailService: {
    sendActivationEmail,
    send,
  },
};
