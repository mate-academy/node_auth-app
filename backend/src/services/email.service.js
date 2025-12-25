import nodemailer from "nodemailer";
import "dotenv/config";

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
    to: email,
    subject,
    html
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${email}/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Activate'
  });
}

function sendConfirmationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/password-reset/confirm/${token}`;
  const html = `
    <h1>Confirm account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    email, html,
    subject: 'Reset password'
  })
}

function sendNotificationEmail(email) {
  const html = `
    <h1>Changed email</h1>
    <p>Email was changed successfully</p>
  `;

  return send({
    email, html,
    subject: 'Notification'
  })
}
export const emailService = {
  sendActivationEmail,
  sendConfirmationEmail,
  sendNotificationEmail,
  send,
}
