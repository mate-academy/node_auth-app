const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send({ email, subject, html }) {
  return transporter.sendMail({
    from: 'Auth API',
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

function sendReset(email, token) {
  const href = `${process.env.CLIENT_HOST}/resetPassword/${email}/${token}`;

  const html = `
    <h1>Reset password</h1>
    <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset' });
}

function sendConfirmation(email, token) {
  const href = `${process.env.CLIENT_HOST}/confirmation/${email}/${token}`;

  const html = `
    <h1>Confirm email</h1>
     <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'CONFIRMATION' });
}

const emailService = {
  sendActivationLink,
  send,
  sendReset,
  sendConfirmation,
};

module.exports = { emailService };
