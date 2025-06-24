require('dotenv/config');

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
  const href = `${process.env.HOST}/activation/${token}`;

  const html = `
    <h1>Activate account</h1>
    <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Activation' });
};

const sendPassConfirmationEmail = (email, accessToken) => {
  const href = `${process.env.HOST}/passResetConfirmation/${accessToken}`;

  const html = `
  <h1>Password reset confirmation</h1>
  <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Password reset confirmation' });
};

const sendEmailChangeConfirmation = (email, accessToken) => {
  const href = `${process.env.HOST}/changeEmailConfirmation/${accessToken}`;

  const html = `
  <h1>Email change confirmation</h1>
  <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Email change confirmation' });
};

const notifyOldEmail = (oldEmail, newEmail) => {
  const html = `
  <h1>Your email has been successfully changed to ${newEmail}</h1>
  `;

  return send({ email: oldEmail, html, subject: 'New email address' });
};

module.exports = {
  send,
  sendActivationEmail,
  sendPassConfirmationEmail,
  sendEmailChangeConfirmation,
  notifyOldEmail,
};
