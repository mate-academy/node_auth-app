import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// const info = await transporter.sendMail({
//   to: 'fafat20198@moravita.com', // list of recipients
//   subject: 'Hello', // subject line
//   text: 'Hello world?', // plain text body
//   html: '<b>Hello world?</b>', // HTML body
// });
// console.log('Email is send');

export function send({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

export function sendActivatationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
 <h1>Activate account</h1>
 <a href="${href}">${href}</a>
 `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
}

export function sendPostResetPassword(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset-password/${token}`;
  const html = `
    <h1>Reset Password</h1>
    <a href="${href}">${href}</a>
  `;
  return send({
    email,
    subject: 'Reset Password',
    html,
  });
}

function sendEmailChangeNotification(oldEmail, newEmail) {
  const html = `
    <h1>Email Changed</h1>
    <p>Your email was changed from ${oldEmail} to ${newEmail}</p>
  `;
  return send({
    email: oldEmail,
    subject: 'Email Changed',
    html,
  });
}

export const emailService = {
  send,
  sendActivatationEmail,
  sendPostResetPassword,
  sendEmailChangeNotification,
};
