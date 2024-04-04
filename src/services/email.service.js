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

export const send = ({ email, subject, html }) => {
  return transporter.sendMail({
    to: email,
    subject,
    html,
  })
};

const sendActivationEmail = (email, token) => {
  const href = `${process.env.CLIENT_HOST}/#/activate/${token}`;
  const html = `
  <h1>Activation</h1>
  <a href="${href}">${href}</a>
  `;

  return send({
    email,
    subject: 'Activate',
    html,
  });
};

const sendToken = (email, token, value) => {
  const html = `
  <h1>Change ${value}</h1>
  <p>${value} change request has been sent from your account. If that was you, enter that text into verify field:</p>
  <h4>${token}</h4>
  `;

  return send({
    email,
    subject: 'Reset',
    html,
  });
};

const sendNotifyEmail = (email, newEmail) => {
  const html = `
  <h1>Changed Email</h1>
  <p>Your email was changed on ${newEmail}.</p>
  `;

  return send({
    email,
    subject: 'Email change',
    html,
  });
};

export const emailService = {
  sendActivationEmail,
  sendToken,
  sendNotifyEmail,
  send,
};
