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

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token, route = '', info) {
  const href = `${process.env.CLIENT_HOST}/${route}/${token}`;
  const { title } = info;

  const html = `
  <h1>${title}</h1>
  <a href="${href}">${href}</a>
  `;

  return send({ email, html, subject: 'Activate' });
}

function sendNotification(email, message) {
  const html = `
    <h1>Notification</h1>
    <p>${message}</p>
  `;

  return send({ email, html, subject: 'Notification' });
}

export const emailService = {
  sendActivationEmail,
  send,
  sendNotification,
};
