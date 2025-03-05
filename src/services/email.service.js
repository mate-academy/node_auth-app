const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
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
  <h1>Activate your account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
}

function sendEmailResetPass(email, token) {
  const href = `${process.env.CLIENT_HOST}/update-password/${token}`;
  const html = `
  <h1>Link for reset the password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset',
    html,
  });
}

function sendEmailUpdateEmail(email) {
  const href = `${process.env.CLIENT_HOST}/`;
  const html = `
  <h1>Email has been changed</h1>
  <p>
    Your email has been changed. If it wasn't you, please let support know. 
  </p>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Changed email',
    html,
  });
}

module.exports = {
  send,
  sendActivationEmail,
  sendEmailResetPass,
  sendEmailUpdateEmail,
};
