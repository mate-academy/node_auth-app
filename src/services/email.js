const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Expenses manager', // sender address
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendEmailChanged(email, newEmail) {
  return send({
    email,
    subject: 'Account email changed',
    html: `
      <h1>Account email changed</h1>
      <p>Your account in Expenses App is connected to ${newEmail}</p>
    `,
  });
}

function sendAccountRemoved(email) {
  return send({
    email,
    subject: 'Account removed',
    html: `
      <h1>Account removed</h1>
      <p>Thank you for using our app!</p>
    `,
  });
}

function sendResetLink(email, token) {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return send({
    email,
    subject: 'Reset password',
    html: `
      <h1>Reset account password</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

module.exports = {
  send,
  sendActivationLink,
  sendResetLink,
  sendEmailChanged,
  sendAccountRemoved,
};
