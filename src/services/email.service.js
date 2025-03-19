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

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Activation' });
}

function sendRefreshPassEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/${token}`;
  const html = `
    <h1>Password reset</h1>
    <a href=${href}>${href}</a>
  `;

  return send({ email, html, subject: 'Refresh password' });
}

function sendEmailWasChangedMessage(email) {
  const html = `
    <h1>Email was changed</h1>
    <div>Your email was changed</div>
  `;

  return send({ email, html, subject: 'Email was changed' });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendRefreshPassEmail,
  sendEmailWasChangedMessage,
};
