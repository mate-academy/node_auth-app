import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject: subject,
    html: html,
  });
}

function sendActivationEmail(name, email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${encodeURIComponent(email)}/${token}`;
  const html = `<h1> Activate Account from ${name} </h1>
      <a href=${href}> ${href} </a>`;

  return send({
    email,
    html,
    subject: 'activate',
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${encodeURIComponent(email)}/${token}`;
  const html = `<h1> Reset password for ${email}</h1>
      <a href=${href}> ${href} </a>`;

  return send({
    email,
    html,
    subject: 'resetPassword',
  });
}

function sendChangeNewEmail(email, newEmail, token) {
  const href = `${process.env.CLIENT_HOST}/change/${encodeURIComponent(email)}/${token}`;

  const html = `<h2> change of email ${email}</h2>
<h1> ON ${newEmail}<h1>
      <a href=${href}> ${href} </a>`;

  return send({
    email,
    html,
    subject: 'changeEmail',
  });
}

function sendNewEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/confirm/${encodeURIComponent(email)}/${token}`;

  const html = `<h2> your new email for login  ${email}</h2>
<h1> ON ${email}</h1>
      <a href=${href}> ${href} </a>`;

  return send({
    email,
    html,
    subject: 'New Email',
  });
}
export const emailServices = {
  send,
  sendActivationEmail,
  sendResetEmail,
  sendChangeNewEmail,
  sendNewEmail,
};
