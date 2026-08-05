import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    to,
    subject,
    text,
    html,
  });
};

const sendActivationMail = ({ email, activationToken }) => {
  const href = `${process.env.CLIENT_HOST}/activate/${activationToken}`;
  const html = `
    <h1>Activate your account</h1>
    <a href="${href}">${href}</a>
  `;

  return send({
    to: email,
    subject: 'Activate your account',
    text: 'Activate your account',
    html,
  });
};

export const emailService = {
  send,
  sendActivationMail,
};
