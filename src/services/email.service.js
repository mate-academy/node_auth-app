import 'dotenv/config';
import nodemailer from 'nodemailer';

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
    subject,
    html,
  });
}

// send email with token
function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

// send email with warning
function sendWarningEmail(email) {
  const html = `
    <h1>Your email was successfully updated</h1>
    <p>We are glad to inform you, that your email was updated</p>
  `;

  return send({
    email,
    html,
    subject: 'Update email',
  });
}

export const emailService = {
  sendActivationEmail,
  sendWarningEmail,
  send,
};
