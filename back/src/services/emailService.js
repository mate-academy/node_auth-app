/* eslint-disable quotes */
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({
    from: "Auth API",
    to: email,
    subject,
    text: "",
    html,
  });
}

export function sendActivationLink(email, token) {
  const link = `${process.env.CLIENT_URL}/activate/${token}`;

  return send({
    email,
    subject: "Account activation",
    html: `
      <h1>Account activation</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendRecoverLink(email, token) {
  const link = `${process.env.CLIENT_URL}/resetpassword?token=${token}&email=${email}`;

  return send({
    email,
    subject: "Password reset",
    html: `
      <h1>Password reset</h1>
      <a href="${link}">${link}</a>
    `,
  });
}

export function sendEmailChanged(email) {
  return send({
    email,
    subject: "Email reset",
    html: `
      <h1>This email was unlinked from account</h1>
    `,
  });
}

export const emailService = {
  send,
  sendActivationLink,
  sendRecoverLink,
  sendEmailChanged,
};
