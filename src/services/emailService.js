'use strict';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    from: 'Auth API',
    to: email,
    subject,
    text: '',
    html,
  });
};

const sendActivalionLink = (email, token) => {
  const link = `http://127.0.0.1:3001/activate/${token}`;

  return send({
    email,
    subject: 'Account activation',
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
};

const sendPasswordResetLink = (email, token) => {
  const link = `http://127.0.0.1:3001/reset/${token}`;

  return send({
    email,
    subject: 'Password reset',
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
};

const sendEmailChangeNotification = (email) => {
  return send({
    email,
    subject: 'Auth App',
    html: `
      <h1>Auth app notification</h1>
      <p>This email is not using for auth app from now</p>
    `,
  });
};

export default {
  send,
  sendActivalionLink,
  sendPasswordResetLink,
  sendEmailChangeNotification,
};
