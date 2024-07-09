import nodemailer from "nodemailer";
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

export const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

const sendActivationEmail = async (email, token) => {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate your account</h1>
  <a href="${href}">Click to activate</a>
  `;

  return send({
    subject: 'Activate your account',
    email,
    html,
  });
}

export const emailService = {
  sendActivationEmail,
  send,
};
