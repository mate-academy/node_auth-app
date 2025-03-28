import nodemailer from "nodemailer";
import "dotenv/config.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function sendEmail({ email, subject, html }) {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activate/${token}`;
  const html = `
    <h1>Activate account</h1>
    <a href='${href}'>${href}</a>
  `;

  return sendEmail({
    email,
    html,
    subject: "Activate",
  });
};

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/reset/${token}`;
  const html = `
    <h1>Reset password</h1>
    <a href='${href}'>${href}</a>
  `;

  return sendEmail({
    email,
    html,
    subject: "Reset password",
  });
}

function sendNewEmail(email, newEmail) {
  return sendEmail({
    email,
    subject: 'Email change',
    html: `
      <h1>Email was successfully changed.</h1>
      <p>New email is ${newEmail}</p>
    `,
  });
}

export const emailService = {
  sendActivationEmail,
  sendEmail,
  sendResetEmail,
  sendNewEmail
};
