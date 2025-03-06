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

function sendActivationEmail(email, token ) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;

  const html = `
  <h1>Activate acount</h1>
  <a href="${href}">${href}</a>
  `;
  send({
    email,
    html,
    subject: 'Activate',
  });
}

const sendNewEmail = (email) => {
  const html = `
    <h1>Email has been changed</h1>
  `;

  return send({
    email,
    html,
    subject: 'Your email has been changed',
  });
};

export const emailService = {
  send,
  sendActivationEmail,
  sendNewEmail
}
