const nodemailer = require('nodemailer');

require('dotenv/config');

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
    subject: subject,
    html: html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/activate/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendResetPasswordEmail(email, token) {
  const href = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
  <h1>Reset password</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Reset' });
}

async function sendEmailChangedNotification(oldEmail, newEmail) {
  const mailOptions = {
    email: oldEmail,
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Зміна даних облікового запису</h2>
          <p>Це повідомлення надходить тому, що електронну адресу вашого облікового запису було змінено на <strong>${newEmail}</strong>.</p>
        </div>
      `,
    subject: 'Change',
  };

  return send(mailOptions);
}

module.exports = {
  sendActivationEmail,
  sendResetPasswordEmail,
  sendEmailChangedNotification,
  send,
};
