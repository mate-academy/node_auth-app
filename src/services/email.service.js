const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.MY_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.MY_EMAIL,
    to: email,
    subject,
    html,
  });
}

async function sendActivationMail(email, token) {
  const href = `${process.env.CLIENT_HOST}/api/users/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href=${href}>${href}</a>
  `;

  const response = send({ email, html, subject: 'Activate' });

  return response;
}

async function sendPasswordReminderEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/api/users/restore/${token}`;
  const html = `
    <h1>{Please visit below link and match new password}</h1>
    <a href=${href}>${href}</a>
  `;

  const response = send({ email, html, subject: 'Restore password' });

  return response;
}

module.exports = { send, sendActivationMail, sendPasswordReminderEmail };
