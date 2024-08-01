require('dotenv').config();
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

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (name, email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <p>Hi ${name}, please activate your account!</p>
  <a href=${href}>${href}</a>`;

  return send({ email, html, subject: 'Activate' });
};

const sendResetEmail = (name, email, token) => {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;
  const html = `
  <h1>Reset your password</h1>
  <p>Hi ${name}, you are trying to reset your password. Please follow this link to complete this action:</p>
  <a href="${href}">${href}</a>
  <p><b>Please note that the token is valid for 60 minutes</b></p>`;

  return send({ email, html, subject: 'Reset password' });
};

const sendGoodbyeEmail = (name, newEmail, oldEmail) => {
  const html = `
    <h1>Reset success</h1>
    <p>Hi ${name},</p>
    <p>Your email has been changed to ${newEmail}</p>`;

  return send({ email: oldEmail, html, subject: 'Email Change' });
};

module.exports = {
  send,
  sendActivationEmail,
  sendResetEmail,
  sendGoodbyeEmail,
};
