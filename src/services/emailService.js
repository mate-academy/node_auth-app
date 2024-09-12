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
    from: 'Auth API', // sender address
    to: email,
    subject,
    text: '',
    html,
  });
}

function sendActivationLink(email, token, options) {
  const link = `${process.env.CLIENT_URL}/${options.route}/${token}`;

  return send({
    email,
    subject: options.subject,
    html: `
      <h1>"${options.title}"</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

function sendNotification(oldEmail, newEmail, options) {
  return send({
    email: oldEmail,
    subject: options.subject,
    html: `
      <h1>"${options.title}"</h1>
      <p>This email is no more valid for application "My App". The email was changed to: "${newEmail}"</p>
    `,
  });
}

module.exports = {
  emailService: {
    send,
    sendActivationLink,
    sendNotification,
  },
};
