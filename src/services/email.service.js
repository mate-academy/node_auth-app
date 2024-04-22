const nodemailer = require('nodemailer');

require('dotenv').config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, CLIENT_HOST } =
  process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

const send = async ({ email, subject, html }) => {
  await transporter.sendMail({
    to: email,
    subject,
    html,
  });
};

const sendActivationEmail = async (email, token) => {
  const href = `${CLIENT_HOST}/activation/${token}`;

  await send({
    subject: 'Activate an account',
    email,
    html: `<h1>Activate account</h1>
    <a href=${href}>${href}</a>`,
  });
};

const sendResetPasswordLink = async (email, token) => {
  const href = `${CLIENT_HOST}/change-password/${token}`;

  await send({
    subject: 'Change password',
    email,
    html: `<h1>Change password</h1>
    <a href="${href}">${href}</a>`,
  });
};

const sendNewEmailActivation = async (email, token) => {
  const href = `${CLIENT_HOST}/change-email/${token}`;

  await send({
    subject: 'Email confirmation',
    email,
    html: `<h1>Email confirmation</h1>
    <a href="${href}">${href}</a>`,
  });
};

module.exports = {
  EmailService: {
    sendActivationEmail,
    send,
    sendResetPasswordLink,
    sendNewEmailActivation,
  },
};
