const nodemailer = require('nodemailer');
const { config } = require('dotenv');

config();

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

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/passwordReset/${token}`;
  const html = `
  <h1>Reset account</h1>
  <p>To reset your password, please click the link below:</p>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Reset Your Password',
  });
}

module.exports = {
  sendResetEmail,
  send,
};
