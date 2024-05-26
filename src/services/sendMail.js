const nodemailer = require('nodemailer');

require('dotenv/config');

const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

async function sendMail(email, url, options = {}) {
  let message = `<h1>link authorisation</h1><br><a href="${url}">${url}</a>`;
  let subject = 'Authorisation';

  if (options.status) {
    message = options.message;
    subject = options.subject;
  }

  await transporter.sendMail({
    from: '"Services"',
    to: email,
    subject,
    html: message,
  });
}

module.exports = {
  sendMail,
};
