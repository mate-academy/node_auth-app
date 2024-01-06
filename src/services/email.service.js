import nodemailer from 'nodemailer';
import 'dotenv/config.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function sendMail({ receivers, subject, html }) {
  return transporter.sendMail({
    from: '"Beer FooF Koch 👻", <facebook@ethereal.email>',
    to: receivers,
    subject,
    html,
  })
}

function sendActivationMail(receivers, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href='${href}'>${href}</a>
  `;

  return sendMail({
     subject: 'Activate me',
    html, receivers,
  });
}

function sendResetMail(receivers, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;
  const html = `
    <h1>Reset account password</h1>
    <a href='${href}'>${href}</a>
  `;

  return sendMail({
    subject: 'Reset me',
    html, receivers,
  })
}

function sendChangeMail(email) {
  return sendMail({
    receivers: email,
    subject: 'Email was changed',
    html: `
      <h1>Your email removed from app</h1>
    `,
  });
}

export const emailService = {
  sendActivationMail, sendResetMail, sendChangeMail
};
