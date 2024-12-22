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

function sendConfirmationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/updateProfile/${token}`;
  const html = `
  <h1>Confirm your email</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Confirm your Email',
  });
}

module.exports = {
  sendConfirmationEmail,
  send,
};
