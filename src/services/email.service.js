/* eslint-disable */
const env = require('dotenv/config');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.API_HOST}/activation/${token}`;
  const html = `
        <h1>Activate acount</h1>
        <a href="${href}">${href}</a>
    `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
};

const sendForgotEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
        <h1>Change a password</h1>
        You asked for changing your password you need to click <a href="${href}">here</a> !
    `;

  return send({
    email,
    html,
    subject: 'Forgot Password',
  });
};

const sendUpdateEmail = (email, token) => {
  const href = `${process.env.API_HOST}/update-email/${token}`;
  const html = `
        <h1>Change an email</h1>
        You asked for changing your email you need to click <a href="${href}">here</a> !
    `;

  return send({
    email,
    html,
    subject: 'Change an email',
  });
};

const sendUpdateOldEmail = (email) => {
  const html = `
        <h1>Change an email</h1>
        Your e-mail was changed, please contact our support if you didn't do that !
    `;

  return send({
    email,
    html,
    subject: 'Changed email',
  });
};

module.exports = {
  send,
  sendActivationEmail,
  sendForgotEmail,
  sendUpdateEmail,
  sendUpdateOldEmail
};
