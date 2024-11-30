require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = async (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;

  const html = `
    <h1>Activation email</h1>
    <p>Please click the link below to activate your account:</p>
    <a href="${href}">${href}</a>
  `;

  send({ email, subject: 'Activation email', html });
};

module.exports = {
  sendActivationEmail,
  send,
};
