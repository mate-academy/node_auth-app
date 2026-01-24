const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function send(email, subject, html) {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    html,
  });
}

function sendActivationLink(email, activationToken) {
  const link = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  const html = `
    <h1>Account activation</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Account activation', html);
}

async function sendResetPasswordNotification(email, activationToken) {
  const link = `${process.env.CLIENT_HOST}/password-reset/${activationToken}`;
  const html = `
    <h1>Password reset</h1>
    <a href="${link}">${link}</a>
  `;

  return send(email, 'Password reset', html);
}

async function sendChangeEmailNotification(oldEmail, newEmail) {
  await transporter.sendMail({
    from: 'Auth API Change email',
    to: oldEmail,
    subject: 'Your email was changed',
    html: `
    <h1>Your email was changed</h1>
    <p>New Email: ${newEmail}</p>
  `,
  });
}

module.exports = {
  mailer: {
    send,
    sendActivationLink,
    sendResetPasswordNotification,
    sendChangeEmailNotification,
  },
};
