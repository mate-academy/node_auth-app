require('dotenv/config');

const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = ({ email, subject, text, html }) => {
  transporter.sendMail({
    to: email, // list of recipients
    subject: subject, // subject line
    text: text, // plain text body
    html: html, // HTML body
  });
};

const sendActivation = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
    text: 'activate your account',
  });
};

const sendRecover = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/recover/${token}`;
  const html = `
  <h1>Recover your password</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Recover',
    text: 'Recover your password',
  });
};

const sendNotification = (email) => {
  const html = `
  <h1>Your email has been changed.</h1>
  <p> Your email has been changed.
  If you did not request this change, please contact support</p>
  `;

  return send({
    email,
    html,
    subject: 'Email has been changed',
    text: 'Your email has been changed.',
  });
};

const emailServices = {
  send,
  sendActivation,
  sendRecover,
  sendNotification,
};

module.exports = {
  emailServices,
};
