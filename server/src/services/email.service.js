import 'dotenv/config'
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
    to: email,
    subject: subject,
    html: html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${email}/${token}`

  const html = `
  <h1>Activate account</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  })
};

function sendPasswordResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`

  const html = `
  <h1>Reset password</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({
    email,
    subject: 'Reset',
    html,
  })
}

function sendEmailChange(email) {
  const href = `${process.env.CLIENT_HOST}/login`

  const html = `
  <h1>Your email has changed</h1>
  <a href="${href}" target="_blank">${href}</a>
  `;

  return send({
    email,
    subject: 'Email Change',
    html,
  })
}

export const emailService = {
  send,
  sendActivationEmail,
  sendPasswordResetEmail,
  sendEmailChange,
}
